import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminAuthResponse } from '../types';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  adminToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; retryAfterSeconds?: number }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_TOKEN_KEY = 'soleform_admin_token';
const ADMIN_USER_KEY = 'soleform_admin_user';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setAdminSession = (token: string | null, user: AdminUser | null) => {
    setAdminToken(token);
    setAdminUser(user);
    if (token && user) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    }
  };

  // Verify stored session on startup
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.admin) {
            setAdminUser(data.admin);
            localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
          }
        } else if (response.status === 401) {
          // Invalidate expired server token
          setAdminSession(null, null);
        }
      } catch (err) {
        console.warn('Admin session verification check encountered network error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; retryAfterSeconds?: number }> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: AdminAuthResponse = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Authentication failed. Please verify your credentials.',
          retryAfterSeconds: data.retryAfterSeconds,
        };
      }

      if (data.token && data.admin) {
        setAdminSession(data.token, data.admin);
        return { success: true };
      }

      return { success: false, error: 'Unexpected server response.' };
    } catch (err) {
      return { success: false, error: 'Unable to reach authentication server. Please check connection.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (adminToken) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
      }
    } catch (err) {
      console.warn('Error during admin logout:', err);
    } finally {
      setAdminSession(null, null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isLoading,
        login,
        logout,
        isAuthenticated: !!adminUser && !!adminToken,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
