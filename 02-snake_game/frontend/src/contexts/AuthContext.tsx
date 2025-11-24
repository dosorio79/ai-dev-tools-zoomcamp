import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApi, User } from '@/api/mockApi';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const existingUser = mockApi.auth.getCurrentUser();
    setUser(existingUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await mockApi.auth.login(email, password);
    setUser(user);
  };

  const signup = async (email: string, username: string, password: string) => {
    const { user } = await mockApi.auth.signup(email, username, password);
    setUser(user);
  };

  const logout = async () => {
    await mockApi.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
