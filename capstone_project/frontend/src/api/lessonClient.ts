import { LessonRequest, LessonResponse } from '@/types/lesson';

const DEFAULT_API_BASE = 'http://localhost:8000';

type RuntimeConfig = {
  API_BASE?: string;
};

function getRuntimeApiBase(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const runtime = (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__;
  return runtime?.API_BASE;
}

export async function generateLesson(request: LessonRequest): Promise<LessonResponse> {
  const runtimeBase = getRuntimeApiBase();
  const base =
    runtimeBase !== undefined
      ? runtimeBase
      : (import.meta.env?.VITE_API_BASE as string | undefined)?.trim() || DEFAULT_API_BASE;
  const normalizedBase = base.replace(/\/$/, '');
  const url = normalizedBase ? `${normalizedBase}/lesson` : '/lesson';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Lesson request failed (${response.status}): ${message}`);
  }

  return response.json();
}
