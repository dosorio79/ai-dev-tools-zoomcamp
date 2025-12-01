import { create } from 'zustand';
import { Session, User, ExecutionResult, Language, WebSocketEvent } from '@/api';

interface InterviewStore {
  // Session state
  currentSession: Session | null;
  currentUser: User | null;
  users: User[];
  
  // Code state
  code: string;
  language: Language;
  
  // Execution state
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
  wsSend: ((event: WebSocketEvent) => void) | null;
  
  // Connection state
  isConnected: boolean;
  
  // Actions
  setSession: (session: Session) => void;
  setCurrentUser: (user: User) => void;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  setCode: (code: string) => void;
  setLanguage: (language: 'javascript' | 'python') => void;
  setIsExecuting: (isExecuting: boolean) => void;
  setExecutionResult: (result: ExecutionResult | null) => void;
  setWsSend: (sender: ((event: WebSocketEvent) => void) | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewStore>((set) => ({
  // Initial state
  currentSession: null,
  currentUser: null,
  users: [],
  code: '',
  language: 'javascript',
  isExecuting: false,
  executionResult: null,
  wsSend: null,
  isConnected: false,

  // Actions
  setSession: (session) => set({ 
    currentSession: session, 
    code: session.code,
    language: session.language 
  }),
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setUsers: (users) => set({ users }),
  
  addUser: (user) => set((state) => ({ 
    users: [...state.users, user] 
  })),
  
  removeUser: (userId) => set((state) => ({ 
    users: state.users.filter(u => u.id !== userId) 
  })),
  
  setCode: (code) => set({ code }),
  
  setLanguage: (language) => set({ language }),
  
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  
  setExecutionResult: (result) => set({ executionResult: result }),

  setWsSend: (sender) => set({ wsSend: sender }),
  
  setIsConnected: (isConnected) => set({ isConnected }),
  
  reset: () => set({
    currentSession: null,
    currentUser: null,
    users: [],
    code: '',
    language: 'javascript',
    isExecuting: false,
    executionResult: null,
    wsSend: null,
    isConnected: false,
  }),
}));
