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
  isImpersonating: boolean;
  isTabImpersonating: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  impersonate: (targetToken: string, targetUser: User) => void;
  exitImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isImpersonating: false,
  isTabImpersonating: false,
  login: () => {},
  logout: () => {},
  refreshProfile: async () => {},
  impersonate: () => {},
  exitImpersonation: async () => {},
});

function normalizeUser(rawUser: any): User | null {
  if (!rawUser) return null;
  const rawRoles = rawUser.roles || [];
  const normalizedRoles: string[] = rawRoles
    .map((r: any) => (typeof r === 'string' ? r : r.role?.name || r.name || ''))
    .filter(Boolean)
    .map((s: string) => s.toUpperCase());

  return {
    ...rawUser,
    roles: normalizedRoles,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isTabImpersonating, setIsTabImpersonating] = useState(false);

  const refreshProfile = async () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const isTab = Boolean(sessionStorage.getItem('is_tab_impersonation'));
    const savedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    const adminToken = localStorage.getItem('admin_impersonator_token');

    setIsTabImpersonating(isTab);
    setIsImpersonating(Boolean(adminToken) || isTab);

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);
    const res = await fetchApi<User>('/auth/me');
    if (res.success && res.data) {
      setUser(normalizeUser(res.data));
    } else {
      if (isTab) {
        sessionStorage.clear();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_impersonator_token');
      }
      setUser(null);
      setToken(null);
      setIsImpersonating(false);
      setIsTabImpersonating(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(normalizeUser(newUser));
    fetchApi<User>('/auth/me').then((res) => {
      if (res.success && res.data) {
        setUser(normalizeUser(res.data));
      }
    });
  };

  const impersonate = (targetToken: string, targetUser: User) => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      localStorage.setItem('admin_impersonator_token', currentToken);
    }
    localStorage.setItem('token', targetToken);
    setToken(targetToken);
    setUser(normalizeUser(targetUser));
    setIsImpersonating(true);
    fetchApi<User>('/auth/me').then((res) => {
      if (res.success && res.data) {
        setUser(normalizeUser(res.data));
      }
    });
  };

  const exitImpersonation = async () => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('is_tab_impersonation')) {
      sessionStorage.clear();
      setIsTabImpersonating(false);
      setIsImpersonating(false);
      // Try closing the tab since it was opened in a new tab
      try {
        window.close();
      } catch (e) {
        // Fallback
      }
      window.location.href = '/admin';
      return;
    }

    const originalAdminToken = localStorage.getItem('admin_impersonator_token');
    if (originalAdminToken) {
      localStorage.setItem('token', originalAdminToken);
      localStorage.removeItem('admin_impersonator_token');
      setToken(originalAdminToken);
      setIsImpersonating(false);
      await refreshProfile();
      window.location.href = '/admin';
    }
  };

  const logout = async () => {
    await fetchApi('/auth/logout', { method: 'POST' });
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('admin_impersonator_token');
    }
    setToken(null);
    setUser(null);
    setIsImpersonating(false);
    setIsTabImpersonating(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isImpersonating,
        isTabImpersonating,
        login,
        logout,
        refreshProfile,
        impersonate,
        exitImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

