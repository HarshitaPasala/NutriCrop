'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: number;
  phone: string;
  name: string;
  preferred_language: string;
  village: string;
  district: string;
  state: string;
  token?: string;
  is_demo?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; hint?: string; sessionId?: string }>;
  verifyOtp: (phone: string, otp: string, sessionId?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('nutricrop_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to load user', e);
      }
    }
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const sendOtp = async (phone: string) => {
    try {
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.detail || 'Failed to send OTP.' };
      }
      return {
        success: true,
        message: data.message,
        hint: data.demo_otp_hint,
        sessionId: data.session_id,
      };
    } catch (e) {
      // Offline / fallback fallback for demo
      return {
        success: true,
        message: 'Demo mode: Please use OTP 123456',
        hint: '123456',
        sessionId: 'local-demo-session',
      };
    }
  };

  const verifyOtp = async (phone: string, otp: string, sessionId?: string) => {
    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, session_id: sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.detail || 'Invalid OTP.' };
      }
      setUser(data);
      localStorage.setItem('nutricrop_user', JSON.stringify(data));
      setIsLoginModalOpen(false);
      return { success: true, message: 'Login successful' };
    } catch (e) {
      // Local fallback
      if (otp === '123456') {
        const demoUser: UserProfile = {
          id: 1,
          phone: phone,
          name: 'Farmer (Demo)',
          preferred_language: 'en',
          village: 'Tenali Village',
          district: 'Guntur',
          state: 'Andhra Pradesh',
          is_demo: true,
        };
        setUser(demoUser);
        localStorage.setItem('nutricrop_user', JSON.stringify(demoUser));
        setIsLoginModalOpen(false);
        return { success: true, message: 'Logged in via demo mode.' };
      }
      return { success: false, message: 'Invalid OTP. For demo, use 123456.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nutricrop_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        sendOtp,
        verifyOtp,
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
