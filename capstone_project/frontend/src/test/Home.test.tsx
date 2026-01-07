import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import Home from '@/pages/Home';
import * as lessonClient from '@/api/lessonClient';
import * as executionClient from '@/api/executeLocally';
import { LessonResponse } from '@/types/lesson';

const mockLesson: LessonResponse = {
  objective: 'Test objective',
  total_minutes: 15,
  sections: [
    {
      id: 'objective',
      title: 'Objective',
      minutes: 1,
      content_markdown: 'Learn about testing',
    },
    {
      id: 'example',
      title: 'Example',
      minutes: 5,
      content_markdown: '```python\nprint("Hello")\n```',
    },
    {
      id: 'exercise',
      title: 'Exercise',
      minutes: 3,
      content_markdown: ':::exercise\nComplete this task\n:::',
    },
  ],
};

vi.mock('@/api/lessonClient', () => ({
  generateLesson: vi.fn(),
}));

vi.mock('@/api/executeLocally', () => ({
  executeLocally: vi.fn(),
  preloadPyodide: vi.fn(),
  isPyodideLoaded: vi.fn(),
}));
const renderHome = () => {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Home />
    </BrowserRouter>
  );
};

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Lesson rendering from mocked API response', () => {
    it('renders lesson sections after API response', async () => {
      vi.mocked(lessonClient.generateLesson).mockResolvedValue(mockLesson);

      renderHome();

      const input = screen.getByPlaceholderText(/pandas groupby/i);
      fireEvent.change(input, { target: { value: 'test topic' } });

      const submitButton = screen.getByRole('button', { name: /generate lesson/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      });

      expect(screen.getByText('Test objective')).toBeInTheDocument();
      expect(screen.getByTestId('section-objective')).toBeInTheDocument();
      expect(screen.getByTestId('section-example')).toBeInTheDocument();
      expect(screen.getByTestId('section-exercise')).toBeInTheDocument();
    });
  });

  describe('Full user flow', () => {
    it('completes flow: input → generate → lesson appears', async () => {
      vi.mocked(lessonClient.generateLesson).mockResolvedValue(mockLesson);

      renderHome();

      // Step 1: Input topic
      const input = screen.getByPlaceholderText(/pandas groupby/i);
      expect(input).toBeInTheDocument();
      fireEvent.change(input, { target: { value: 'pandas performance' } });

      // Step 2: Select difficulty (intermediate is default)
      const beginnerButton = screen.getByRole('button', { name: /beginner/i });
      fireEvent.click(beginnerButton);

      // Step 3: Generate lesson
      const generateButton = screen.getByRole('button', { name: /generate lesson/i });
      expect(generateButton).not.toBeDisabled();
      fireEvent.click(generateButton);

      // Step 4: Wait for lesson to appear
      await waitFor(() => {
        expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      });

      // Verify API was called with correct parameters
      expect(lessonClient.generateLesson).toHaveBeenCalledWith({
        topic: 'pandas performance',
        level: 'beginner',
      });

      // Step 5: Reset button works
      const resetButton = screen.getByRole('button', { name: /new lesson/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.queryByTestId('lesson-content')).not.toBeInTheDocument();
      });
    });

    it('marks generate button as disabled when topic is empty', () => {
      renderHome();

      const generateButton = screen.getByRole('button', { name: /generate lesson/i });
      expect(generateButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('focuses and highlights topic input when submitting with empty topic', () => {
      renderHome();

      const input = screen.getByPlaceholderText(/pandas groupby/i);
      const generateButton = screen.getByRole('button', { name: /generate lesson/i });

      fireEvent.click(generateButton);

      expect(input).toHaveFocus();
      expect(input).toHaveAttribute('data-highlight', 'true');
    });

    it('shows loading state while generating', async () => {
      vi.mocked(lessonClient.generateLesson).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockLesson), 100))
      );

      renderHome();

      const input = screen.getByPlaceholderText(/pandas groupby/i);
      fireEvent.change(input, { target: { value: 'test' } });

      const generateButton = screen.getByRole('button', { name: /generate lesson/i });
      fireEvent.click(generateButton);

      expect(screen.getByText(/planning a 15-minute lesson/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      });
    });

    it('disables inputs while loading and shows the first loading message', () => {
      vi.mocked(lessonClient.generateLesson).mockImplementation(
        () => new Promise(() => {})
      );

      renderHome();

      const input = screen.getByPlaceholderText(/pandas groupby/i);
      fireEvent.change(input, { target: { value: 'test' } });

      const generateButton = screen.getByRole('button', { name: /generate lesson/i });
      fireEvent.click(generateButton);

      expect(generateButton).toBeDisabled();
      expect(input).toBeDisabled();
      expect(screen.getByText(/planning a 15-minute lesson/i)).toBeInTheDocument();
    });
  });

  describe('Python code block with Run button', () => {
    it('renders Run button for Python code and shows execution output', async () => {
      vi.mocked(lessonClient.generateLesson).mockResolvedValue(mockLesson);
      vi.mocked(executionClient.isPyodideLoaded).mockReturnValue(true);
      vi.mocked(executionClient.preloadPyodide).mockResolvedValue(undefined);
      vi.mocked(executionClient.executeLocally).mockResolvedValue({
        output: 'Hello from Python',
        error: null,
        timestamp: new Date().toISOString(),
      });

      renderHome();

      const input = screen.getByPlaceholderText(/pandas groupby/i);
      fireEvent.change(input, { target: { value: 'test' } });

      const generateButton = screen.getByRole('button', { name: /generate lesson/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      });

      // Find the Run button for Python code
      const runButton = screen.getByTestId('run-button');
      expect(runButton).toBeInTheDocument();

      // Click Run button
      fireEvent.click(runButton);

      // Verify execution output appears
      await waitFor(() => {
        expect(screen.getByTestId('execution-output')).toBeInTheDocument();
      });
      expect(screen.getByText(/hello from python/i)).toBeInTheDocument();
    });

    it('shows guidance when execution returns no stdout', async () => {
      vi.mocked(lessonClient.generateLesson).mockResolvedValue(mockLesson);
      vi.mocked(executionClient.isPyodideLoaded).mockReturnValue(true);
      vi.mocked(executionClient.preloadPyodide).mockResolvedValue(undefined);
      vi.mocked(executionClient.executeLocally).mockResolvedValue({
        output: '',
        error: null,
        timestamp: new Date().toISOString(),
      });

      renderHome();

      const input = screen.getByPlaceholderText(/pandas groupby/i);
      fireEvent.change(input, { target: { value: 'test' } });

      const generateButton = screen.getByRole('button', { name: /generate lesson/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      });

      const runButton = screen.getByTestId('run-button');
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByTestId('execution-output-empty')).toBeInTheDocument();
      });
      expect(screen.getByText(/no output yet/i)).toBeInTheDocument();
    });

    it('shows Stop button while running and hides it after completion', async () => {
      vi.mocked(lessonClient.generateLesson).mockResolvedValue(mockLesson);
      vi.mocked(executionClient.isPyodideLoaded).mockReturnValue(true);
      vi.mocked(executionClient.preloadPyodide).mockResolvedValue(undefined);
      let resolveRun: (value: { output: string; error: string | null; timestamp: string }) => void = () => {};
      const runPromise = new Promise<{ output: string; error: string | null; timestamp: string }>((resolve) => {
        resolveRun = resolve;
      });
      vi.mocked(executionClient.executeLocally).mockReturnValue(runPromise);

      renderHome();

      const input = screen.getByPlaceholderText(/pandas groupby/i);
      fireEvent.change(input, { target: { value: 'test' } });

      const generateButton = screen.getByRole('button', { name: /generate lesson/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      });

      const runButton = screen.getByTestId('run-button');
      fireEvent.click(runButton);

      expect(screen.getByTestId('stop-button')).toBeInTheDocument();

      resolveRun({
        output: 'Done',
        error: null,
        timestamp: new Date().toISOString(),
      });

      await waitFor(() => {
        expect(screen.queryByTestId('stop-button')).not.toBeInTheDocument();
      });
    });

    it('shows timeout hint when execution exceeds limit', async () => {
      vi.mocked(lessonClient.generateLesson).mockResolvedValue(mockLesson);
      vi.mocked(executionClient.isPyodideLoaded).mockReturnValue(true);
      vi.mocked(executionClient.preloadPyodide).mockResolvedValue(undefined);
      vi.mocked(executionClient.executeLocally).mockReturnValue(new Promise(() => {}));

      renderHome();

      const input = screen.getByPlaceholderText(/pandas groupby/i);
      fireEvent.change(input, { target: { value: 'test' } });

      const generateButton = screen.getByRole('button', { name: /generate lesson/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      });

      vi.useFakeTimers();
      try {
        const runButton = screen.getByTestId('run-button');
        fireEvent.click(runButton);

        await act(async () => {
          vi.advanceTimersByTime(10000);
        });

        expect(screen.getByTestId('execution-timeout-hint')).toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });

    it('does NOT show Run button for non-Python code blocks', async () => {
      const lessonWithJsCode: LessonResponse = {
        ...mockLesson,
        sections: [
          {
            id: 'example',
            title: 'Example',
            minutes: 5,
            content_markdown: '```javascript\nconsole.log("Hello")\n```',
          },
        ],
      };
      vi.mocked(lessonClient.generateLesson).mockResolvedValue(lessonWithJsCode);

      renderHome();

      const input = screen.getByPlaceholderText(/pandas groupby/i);
      fireEvent.change(input, { target: { value: 'test' } });

      const generateButton = screen.getByRole('button', { name: /generate lesson/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      });

      // Run button should NOT exist for JavaScript code
      expect(screen.queryByTestId('run-button')).not.toBeInTheDocument();
    });
  });

  describe('Exercise block rendering', () => {
    it('renders :::exercise::: blocks as distinct Exercise cards', async () => {
      vi.mocked(lessonClient.generateLesson).mockResolvedValue(mockLesson);

      renderHome();

      const input = screen.getByPlaceholderText(/pandas groupby/i);
      fireEvent.change(input, { target: { value: 'test' } });

      const generateButton = screen.getByRole('button', { name: /generate lesson/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      });

      // Exercise block should render with Exercise label
      expect(screen.getByText('Exercise', { selector: 'span' })).toBeInTheDocument();
      
      // The exercise content should be visible
      expect(screen.getByText(/Complete this task/i)).toBeInTheDocument();
    });
  });

  describe('Difficulty selector', () => {
    it('switches between beginner and intermediate levels', async () => {
      vi.mocked(lessonClient.generateLesson).mockResolvedValue(mockLesson);

      renderHome();

      const beginnerButton = screen.getByRole('button', { name: /beginner/i });
      const intermediateButton = screen.getByRole('button', { name: /intermediate/i });

      // Default should be intermediate
      expect(intermediateButton).toHaveClass('border-primary');

      // Click beginner
      fireEvent.click(beginnerButton);
      expect(beginnerButton).toHaveClass('border-primary');

      // Submit and verify level is passed correctly
      const input = screen.getByPlaceholderText(/pandas groupby/i);
      fireEvent.change(input, { target: { value: 'test' } });

      const generateButton = screen.getByRole('button', { name: /generate lesson/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(lessonClient.generateLesson).toHaveBeenCalledWith({
          topic: 'test',
          level: 'beginner',
        });
      });
    });
  });
});
