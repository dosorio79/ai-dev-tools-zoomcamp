export interface LessonRequest {
  session_id?: string;
  topic: string;
  level: 'beginner' | 'intermediate';
}

export interface LessonSection {
  id: string;
  title: string;
  minutes: number;
  content_markdown: string;
}

export interface LessonResponse {
  objective: string;
  total_minutes: number;
  sections: LessonSection[];
}
