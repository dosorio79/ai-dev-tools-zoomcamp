import { describe, it, expect, beforeEach } from 'vitest';
import { useInterviewStore } from '@/store/interviewStore';
import { Session, User } from '@/api/mockApi';

describe('Interview Store', () => {
  beforeEach(() => {
    useInterviewStore.getState().reset();
  });

  it('should have correct initial state', () => {
    const state = useInterviewStore.getState();
    
    expect(state.currentSession).toBeNull();
    expect(state.currentUser).toBeNull();
    expect(state.users).toEqual([]);
    expect(state.code).toBe('');
    expect(state.language).toBe('javascript');
    expect(state.isExecuting).toBe(false);
    expect(state.executionResult).toBeNull();
    expect(state.isConnected).toBe(false);
  });

  it('should set session correctly', () => {
    const session: Session = {
      id: 'test-123',
      createdAt: new Date(),
      code: 'console.log("test");',
      language: 'javascript',
    };

    useInterviewStore.getState().setSession(session);
    
    const state = useInterviewStore.getState();
    expect(state.currentSession).toEqual(session);
    expect(state.code).toBe(session.code);
    expect(state.language).toBe(session.language);
  });

  it('should add and remove users', () => {
    const user1: User = { id: '1', name: 'User 1', color: '#FF0000' };
    const user2: User = { id: '2', name: 'User 2', color: '#00FF00' };

    useInterviewStore.getState().addUser(user1);
    useInterviewStore.getState().addUser(user2);
    
    expect(useInterviewStore.getState().users).toHaveLength(2);

    useInterviewStore.getState().removeUser(user1.id);
    
    const state = useInterviewStore.getState();
    expect(state.users).toHaveLength(1);
    expect(state.users[0].id).toBe(user2.id);
  });

  it('should update code', () => {
    useInterviewStore.getState().setCode('new code');
    expect(useInterviewStore.getState().code).toBe('new code');
  });

  it('should update language', () => {
    useInterviewStore.getState().setLanguage('python');
    expect(useInterviewStore.getState().language).toBe('python');
  });

  it('should reset to initial state', () => {
    // Set some state
    useInterviewStore.getState().setCode('test');
    useInterviewStore.getState().setLanguage('python');
    useInterviewStore.getState().setIsConnected(true);

    // Reset
    useInterviewStore.getState().reset();

    // Check initial state
    const state = useInterviewStore.getState();
    expect(state.code).toBe('');
    expect(state.language).toBe('javascript');
    expect(state.isConnected).toBe(false);
  });
});
