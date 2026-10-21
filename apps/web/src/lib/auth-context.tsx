'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  roles: string[];
  businessMemberships?: {
    businessId: string;
    businessName: string;
    businessSlug: string;
    role: string;
    verificationStatus: string;
  }[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);
    const res = await fetchApi<User>('/auth/me');
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await fetchApi('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

