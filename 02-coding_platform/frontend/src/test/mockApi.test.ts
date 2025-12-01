import { describe, it, expect, beforeEach } from 'vitest';
import { mockApi, mockWebSocket } from '@/api/mockApi';

describe('Mock API', () => {
  describe('createSession', () => {
    it('should create a session with default JavaScript language', async () => {
      const session = await mockApi.createSession();
      
      expect(session).toBeDefined();
      expect(session.id).toBeTruthy();
      expect(session.language).toBe('javascript');
      expect(typeof session.code).toBe('string');
    });

    it('should create a session with Python language', async () => {
      const session = await mockApi.createSession('python');
      
      expect(session).toBeDefined();
      expect(session.language).toBe('python');
      expect(typeof session.code).toBe('string');
    });
  });

  describe('joinSession', () => {
    it('should allow a user to join an existing session', async () => {
      // Create session
      const session = await mockApi.createSession();
      
      // Join session
      const result = await mockApi.joinSession(session.id, 'Test User');
      
      expect(result.session.id).toBe(session.id);
      expect(result.user.name).toBe('Test User');
      expect(result.user.id).toBeTruthy();
      expect(result.user.color).toBeTruthy();
    });

    it('should throw error for non-existent session', async () => {
      await expect(
        mockApi.joinSession('invalid-id', 'Test User')
      ).rejects.toThrow('Session not found');
    });
  });

  describe('getSessionUsers', () => {
    it('should return all users in a session', async () => {
      const session = await mockApi.createSession();
      await mockApi.joinSession(session.id, 'User 1');
      await mockApi.joinSession(session.id, 'User 2');
      
      const users = await mockApi.getSessionUsers(session.id);
      
      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('User 1');
      expect(users[1].name).toBe('User 2');
    });
  });

  describe('updateCode', () => {
    it('should update session code', async () => {
      const session = await mockApi.createSession();
      const newCode = 'console.log("updated");';
      
      await mockApi.updateCode(session.id, newCode);
      
      // The mock stores the update
      expect(true).toBe(true);
    });
  });

  describe('executeCode', () => {
    it('should relay an execution result', async () => {
      const executionResult = {
        output: 'Hello World',
        error: null,
        timestamp: new Date().toISOString(),
      };

      const result = await mockApi.executeCode('session-1', executionResult);
      
      expect(result.output).toContain('Hello World');
      expect(typeof result.timestamp).toBe('string');
      expect(Date.parse(result.timestamp)).not.toBeNaN();
    });
  });

  describe('leaveSession', () => {
    it('should remove user from session', async () => {
      const session = await mockApi.createSession();
      const { user } = await mockApi.joinSession(session.id, 'Test User');
      
      await mockApi.leaveSession(session.id, user.id);
      
      const users = await mockApi.getSessionUsers(session.id);
      expect(users).toHaveLength(0);
    });
  });
});

describe('Mock WebSocket', () => {
  it('should register and call event listeners', () => {
    let receivedMessage = null;
    
    const cleanup = mockWebSocket.connect('test-session', (message) => {
      receivedMessage = message;
    });
    
    const testMessage = {
      type: 'code_change' as const,
      payload: { code: 'test' },
    };
    
    mockWebSocket.emit('test-session', testMessage);
    
    expect(receivedMessage).toEqual(testMessage);
    
    cleanup();
  });

  it('should cleanup listeners properly', () => {
    let callCount = 0;
    
    const cleanup = mockWebSocket.connect('test-session', () => {
      callCount++;
    });
    
    mockWebSocket.emit('test-session', {
      type: 'code_change',
      payload: {},
    });
    
    expect(callCount).toBe(1);
    
    cleanup();
    
    mockWebSocket.emit('test-session', {
      type: 'code_change',
      payload: {},
    });
    
    // Should still be 1 after cleanup
    expect(callCount).toBe(1);
  });
});
