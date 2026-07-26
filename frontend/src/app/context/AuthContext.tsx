import { createContext, useContext, useState, ReactNode } from 'react';
import { api, setToken, clearToken } from '../utils/api';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
}

const SESSION_KEY = 'vendr-session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadSession(): User | null {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    const token = localStorage.getItem('vendr-token');
    // Only restore session if token is also present (valid session)
    if (saved && token) {
      return JSON.parse(saved);
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadSession);

  const persistSession = (nextUser: User, token: string) => {
    setToken(token);
    setUser(nextUser);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    } catch {
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const data = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password });
      persistSession(data.user, data.token);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Login failed.' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const data = await api.post<{ token: string; user: User }>('/api/auth/register', { name, email, password });
      persistSession(data.user, data.token);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Registration failed.' };
    }
  };

  const logout = () => {
    setUser(null);
    clearToken();
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
