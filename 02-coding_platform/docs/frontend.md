# CodeCollab Interview Platform

A real-time collaborative coding interview platform built with React, TypeScript, and Vite. Features live code editing, syntax highlighting, and mock code execution with a fully simulated backend.

## Features

- **Real-time Collaboration**: Mock WebSocket implementation for simulated real-time updates
- **Code Editor**: Monaco Editor with syntax highlighting for JavaScript and Python
- **Live Execution**: Mock code execution with output display
- **User Presence**: Track and display connected participants
- **Session Management**: Create and join interview sessions
- **Language Support**: JavaScript and Python with syntax highlighting
- **Fully Tested**: Unit tests with Vitest and React Testing Library

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS with Glacier theme
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Testing**: Vitest + React Testing Library
- **Routing**: React Router v6

## Project Structure

```
src/
├── api/
│   └── mockApi.ts           # Centralized mock API and WebSocket
├── components/
│   ├── CodeEditor.tsx       # Monaco editor wrapper
│   ├── ExecutionPanel.tsx   # Code execution and output
│   ├── Header.tsx           # App header with session info
│   └── UserPresence.tsx     # Participant list
├── pages/
│   ├── Home.tsx            # Landing page
│   ├── CreateSession.tsx   # Create new session
│   ├── JoinSession.tsx     # Join existing session
│   └── InterviewSession.tsx # Main interview interface
├── store/
│   └── interviewStore.ts   # Zustand state management
└── test/
    ├── mockApi.test.ts     # API tests
    ├── components/         # Component tests
    └── store/             # Store tests
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd codecollab-interview

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report

## Testing

The project uses Vitest and React Testing Library for testing. Tests are located in `src/test/` and cover:

- Mock API functionality
- Zustand store behavior
- Component rendering and interactions

Run tests with:

```bash
npm run test
```

## Mock API

All backend interactions are mocked in `src/api/mockApi.ts`. This includes:

- Session creation and management
- User joining/leaving
- Code synchronization
- WebSocket event simulation
- Code execution

The mock API simulates network latency and real-world behavior for a realistic development experience.

## Integration with Real Backend

To connect to a real backend:

1. Replace mock API calls in `src/api/mockApi.ts` with real API endpoints
2. Implement actual WebSocket connections
3. Update the store to handle real-time events from the server
4. Add proper error handling and reconnection logic

## Design System

The project uses the Glacier theme with:

- HSL-based color system
- Semantic design tokens
- Dark mode support
- Responsive utilities
- Custom shadcn/ui components

## Contributing

1. Keep all mocked behavior in `src/api/mockApi.ts`
2. Add tests for new features
3. Follow the existing code structure
4. Use TypeScript strictly
5. Maintain the design system conventions

## License

MIT
