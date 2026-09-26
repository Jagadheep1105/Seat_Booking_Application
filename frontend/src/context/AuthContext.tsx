import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pulse_pass_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pulse_pass_token') || null;
  });

  const login = async (email: string, pass: string) => {
    const res = await api.post('/auth/login', { email, password: pass });
    const { token: authToken, user: userData } = res.data;

    setToken(authToken);
    setUser(userData);
    localStorage.setItem('pulse_pass_token', authToken);
    localStorage.setItem('pulse_pass_user', JSON.stringify(userData));
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.post('/auth/register', { name, email, password: pass });
    const { token: authToken, user: userData } = res.data;

    setToken(authToken);
    setUser(userData);
    localStorage.setItem('pulse_pass_token', authToken);
    localStorage.setItem('pulse_pass_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pulse_pass_token');
    localStorage.removeItem('pulse_pass_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
