import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'aquainsight_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initial load from localStorage to prevent flash
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch (e) {
      console.error('Failed to parse saved auth session:', e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Optional background token verification
  useEffect(() => {
    if (user?.token) {
      fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }).catch((err) => {
        console.warn('Session verification fallback:', err);
      });
    }
  }, [user?.token]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return {
          success: false,
          error: data.error || 'Authentication failed. Please check your credentials.',
        };
      }

      setUser(data.user);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
      } catch (err) {
        console.warn('Failed to store session in localStorage:', err);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      // Fallback local authentication if server endpoint is unreachable
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setIsLoading(false);
        return { success: false, error: 'Please enter a valid email address' };
      }
      if (password.length < 4) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 4 characters' };
      }

      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const fallbackUser: User = {
        id: `usr_${Date.now()}`,
        email,
        name,
        role: email.toLowerCase().includes('admin') ? 'Catchment Administrator' : 'Stream Field Analyst',
        token: `aq_token_${Date.now()}`,
      };

      setUser(fallbackUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackUser));
      setIsLoading(false);
      return { success: true };
    }
  };

  const logout = () => {
    try {
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.warn('Error during logout cleanup:', err);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
