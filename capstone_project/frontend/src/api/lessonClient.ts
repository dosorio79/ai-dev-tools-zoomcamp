import { LessonRequest, LessonResponse } from '@/types/lesson';

const DEFAULT_API_BASE = 'http://localhost:8000';

export async function generateLesson(request: LessonRequest): Promise<LessonResponse> {
  const base = (import.meta.env?.VITE_API_BASE as string | undefined)?.trim() || DEFAULT_API_BASE;
  const url = `${base.replace(/\/$/, '')}/lesson`;
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
