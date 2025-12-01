import { nanoid } from 'nanoid';
import { Session, User, ExecutionResult, Language, WebSocketEvent } from './client';

// Mock data storage
const sessions = new Map<string, Session>();
const sessionUsers = new Map<string, User[]>();

// Mock WebSocket event listeners
type EventListener = (message: WebSocketEvent) => void;
const eventListeners = new Map<string, EventListener[]>();

// Mock API functions
export const mockApi = {
  // Create a new session
  createSession: async (language: Language = 'javascript'): Promise<Session> => {
    await delay(300); // Simulate network latency
    
    const session: Session = {
      id: nanoid(10),
      createdAt: new Date().toISOString(),
      code: '',
      language,
    };
    
    sessions.set(session.id, session);
    sessionUsers.set(session.id, []);
    
    return session;
  },

  // Join an existing session
  joinSession: async (sessionId: string, userName: string): Promise<{ session: Session; user: User }> => {
    await delay(300);
    
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const user: User = {
      id: nanoid(8),
      name: userName,
      color: getRandomColor(),
    };

    const users = sessionUsers.get(sessionId) || [];
    users.push(user);
    sessionUsers.set(sessionId, users);

    // Simulate broadcasting user joined event
    setTimeout(() => {
      mockWebSocket.emit(sessionId, {
        type: 'user_joined',
        payload: { user },
      });
    }, 100);

    return { session, user };
  },

  // Get session users
  getSessionUsers: async (sessionId: string): Promise<User[]> => {
    await delay(100);
    return sessionUsers.get(sessionId) || [];
  },

  // Update code (simulates collaborative editing)
  updateCode: async (sessionId: string, code: string): Promise<void> => {
    await delay(50); // Minimal delay for real-time feel
    
    const session = sessions.get(sessionId);
    if (session) {
      session.code = code;
      
      // Simulate broadcasting code change to other users
      setTimeout(() => {
        mockWebSocket.emit(sessionId, {
          type: 'code_change',
          payload: { code },
        });
      }, 50);
    }
  },

  // Change language
  changeLanguage: async (sessionId: string, language: Language): Promise<void> => {
    await delay(100);
    
    const session = sessions.get(sessionId);
    if (session) {
      session.language = language;
      session.code = getDefaultCode(language);
      
      setTimeout(() => {
        mockWebSocket.emit(sessionId, {
          type: 'language_change',
          payload: { language },
        });
      }, 50);
    }
  },

  // Execute code (mock execution)
  executeCode: async (sessionId: string, result: ExecutionResult): Promise<ExecutionResult> => {
    await delay(200); // Simulate network time

    setTimeout(() => {
      mockWebSocket.emit(sessionId, {
        type: 'execution_result',
        payload: result,
      });
    }, 25);

    return result;
  },

  // Leave session
  leaveSession: async (sessionId: string, userId: string): Promise<void> => {
    await delay(100);
    
    const users = sessionUsers.get(sessionId);
    if (users) {
      const updatedUsers = users.filter(u => u.id !== userId);
      sessionUsers.set(sessionId, updatedUsers);
      
      setTimeout(() => {
        mockWebSocket.emit(sessionId, {
          type: 'user_left',
          payload: { user },
        });
      }, 50);
    }
  },
};

// Mock WebSocket implementation
export const mockWebSocket = {
  connect: (sessionId: string, onMessage: EventListener): (() => void) => {
    if (!eventListeners.has(sessionId)) {
      eventListeners.set(sessionId, []);
    }
    
    const listeners = eventListeners.get(sessionId)!;
    listeners.push(onMessage);

    // Return cleanup function
    return () => {
      const index = listeners.indexOf(onMessage);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  },

  emit: (sessionId: string, message: WebSocketEvent) => {
    const listeners = eventListeners.get(sessionId) || [];
    listeners.forEach(listener => listener(message));
  },

  // Simulate random user activity for demo purposes
  simulateActivity: (sessionId: string) => {
    const interval = setInterval(() => {
      const users = sessionUsers.get(sessionId);
      if (!users || users.length === 0) {
        clearInterval(interval);
        return;
      }

      // Randomly simulate events
      const rand = Math.random();
      if (rand > 0.95) {
        // Rarely simulate a user joining
        const newUser: User = {
          id: nanoid(8),
          name: `User ${Math.floor(Math.random() * 100)}`,
          color: getRandomColor(),
        };
        users.push(newUser);
        mockWebSocket.emit(sessionId, {
          type: 'user_joined',
          payload: { user: newUser },
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  },
};

// Helper functions
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getDefaultCode(language: Language): string {
  if (language === 'javascript') {
    return `// Welcome to CodeCollab Interview!
// Write your JavaScript solution here

function solution(input) {
  // Your code here
  return input;
}

console.log(solution("Hello World"));`;
  } else {
    return `# Welcome to CodeCollab Interview!
# Write your Python solution here

def solution(input):
    # Your code here
    return input

print(solution("Hello World"))`;
  }
}

function mockExecute(code: string, language: string): string {
  // Very basic mock execution logic
  if (code.includes('console.log') || code.includes('print')) {
    // Extract what's being logged/printed (very simplified)
    const match = code.match(/(?:console\.log|print)\(['"`](.+?)['"`]\)/);
    if (match) {
      return match[1];
    }
  }

  // Return mock outputs based on patterns
  if (code.includes('return')) {
    return `Execution completed successfully!\nOutput: [Function result]`;
  }

  return `Code executed successfully!\n${language === 'javascript' ? '> undefined' : ''}`;
}
