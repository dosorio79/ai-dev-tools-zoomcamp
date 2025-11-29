import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  it('should initialize with no user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      // Wait for loading to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.user).toBeNull();
  });

  it('should login user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('should signup user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup('new@example.com', 'newuser', 'password123');
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.username).toBe('newuser');
  });

  it('should logout user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });
});
