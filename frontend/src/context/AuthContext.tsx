import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiLogin, apiRegister, apiGetMe } from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'participant';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hms_token'));
  const [loading, setLoading] = useState(true);

  // On mount, verify stored token is still valid
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await apiGetMe();
        setUser(res.user);
      } catch {
        // Token invalid/expired – clear it
        localStorage.removeItem('hms_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  const saveSession = (data: { token: string; user: User }) => {
    localStorage.setItem('hms_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const data = await apiLogin({ email, password });
    saveSession(data);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const data = await apiRegister({ name, email, password, role });
    saveSession(data);
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
