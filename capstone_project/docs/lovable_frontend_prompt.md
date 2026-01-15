Project name: uLearn
Tagline: Micro-learning, generated on demand

Build a modern, clean React frontend for uLearn, a micro-learning platform that generates focused 15-minute lessons on demand using AI.

Note: This prompt reflects the original mocked-API build; the current frontend calls the backend directly.

The frontend must be production-quality in structure and readability, but all backend interactions must be MOCKED. The mocked API must strictly follow the provided API contract so it can later be replaced by a real backend without refactoring.

====================
PRODUCT CONCEPT
====================

uLearn helps data and Python practitioners quickly learn or refresh a topic in 15 minutes.

User flow:
- User enters a topic (free text)
- User selects a difficulty level (Beginner / Intermediate)
- User clicks “Generate lesson”
- A structured lesson is rendered from Markdown
- Python code snippets can optionally be “run” (execution can be stubbed)

No authentication. No user accounts. Stateless UI.

====================
TECH REQUIREMENTS
====================

- Framework: React + TypeScript
- Bundler: Vite
- Styling: Tailwind CSS (REQUIRED)
- State management: local React state only
- Markdown rendering: REQUIRED
- Syntax highlighting: REQUIRED
- Backend: mocked only (no real HTTP calls)

Styling rules:
- Use Tailwind utility classes directly in components
- Do not introduce custom CSS unless strictly necessary
- Focus on readability and spacing, not visual effects

====================
LAYOUT
====================

Header:
- App name: uLearn
- Tagline: “Micro-learning, generated on demand”

Main area:
- Input panel
- Lesson display

====================
INPUT PANEL
====================

- Text input label: “What do you want to learn?”
- Placeholder: “e.g., pandas groupby performance”
- Difficulty selector options:
  - Beginner
  - Intermediate
- Primary button: “Generate lesson”

Button behavior:
- Disabled while loading
- Shows loading state while lesson is being generated

====================
LESSON DISPLAY
====================

Render the lesson in clearly separated sections, in this order:
1) Objective
2) Concept
3) Example
4) Exercise
5) Summary

Each section must show:
- Title
- Estimated time (minutes)
- Markdown-rendered content

Include a “New lesson” or “Reset” button to clear the current lesson and allow a new request.

====================
MARKDOWN CONVENTIONS (CRITICAL)
====================

The backend returns Markdown in each section.content_markdown.

The frontend must:
- Render Markdown
- Apply syntax highlighting to code blocks

Code block behavior:
- Detect fenced code blocks with language identifiers
- If the language is python, display a “Run” button
- Clicking “Run” can be stubbed (e.g., show “Execution not enabled yet”)
- For non-python languages, do not show the Run button

Exercise block behavior:
- Support custom blocks of the form :::exercise ... :::
- Render these blocks as a visually distinct Exercise card
- No grading, no submission, no persistence

====================
MOCKED BACKEND API (NO REAL HTTP)
====================

The frontend must NOT hardcode lesson content in components.
It must call a mocked API client that returns data matching this contract.

Endpoint:
POST /lesson

Request body schema:
- session_id: optional uuid string
- topic: string
- level: beginner or intermediate

Response body schema:
- objective: string
- total_minutes: number (always 15)
- sections: array of objects with:
  - id: string
  - title: string
  - minutes: number
  - content_markdown: string

Mock behavior requirements:
- Generate a realistic mocked lesson response
- Example topic: “pandas groupby performance”
- Example level: intermediate
- Include at least one python code block so the Run button can be tested
- Include one :::exercise block so the Exercise card can be tested
- Keep the mock isolated in src/api/lessonClient.ts
- All components must consume this client as if it were real

====================
FRONTEND ARCHITECTURE
====================

Use this folder structure:

src/
- api/lessonClient.ts
- types/lesson.ts
- pages/Home.tsx
- components/LessonRenderer.tsx
- components/LessonSection.tsx
- components/CodeBlock.tsx
- components/ExerciseBlock.tsx
- App.tsx
- main.tsx

TypeScript requirements:
- Define interfaces matching the API schema:
  LessonRequest, LessonResponse, LessonSection
- Do not use any

Backend communication rules:
- Centralize all API calls in src/api/lessonClient.ts
- Components must not contain fetch() or hardcoded lesson data
- Home page triggers lesson generation and stores state
- Lesson data is passed down via props

====================
TESTS (REQUIRED)
====================

Set up frontend tests using:
- Vitest
- React Testing Library

Minimum tests:
1) Lesson rendering from mocked API response
2) Full user flow (input → generate → lesson appears)
3) Python code block renders a “Run” button and stubbed execution message

Testing constraints:
- Mock the API client module
- Do not rely on timers
- Provide npm scripts:
  - dev
  - build
  - test

====================
NON-GOALS
====================

Do NOT implement:
- Authentication
- User accounts
- Progress tracking
- Real backend calls
- Persistence
- Real code execution

====================
UX TONE
====================

- Calm
- Focused
- Professional
- Learning-first
- No gamification
- Emphasis on readability

====================
FINAL INSTRUCTION
====================

Generate the full React codebase meeting all requirements above. Ensure the mocked API strictly follows the contract so it can later be swapped for a real backend with minimal changes.
