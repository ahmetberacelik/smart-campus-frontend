/**
 * Authentication Context
 * Kullanıcı authentication state'ini yönetir
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '@/services/api';
import type { User, LoginRequest, RegisterRequest, ApiError } from '@/types/api.types';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Sayfa yüklendiğinde kullanıcı bilgisini kontrol et
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Token geçerli mi kontrol et
          try {
            await userService.getMe();
          } catch (error) {
            // Token geçersizse temizle
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success('Giriş başarılı!');
        navigate('/dashboard');
      } else {
        throw new Error(response.error?.message || 'Giriş başarısız');
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Giriş yapılırken bir hata oluştu');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      
      if (response.success) {
        toast.success('Kayıt başarılı! Lütfen email adresinizi doğrulayın.');
        navigate('/login');
      } else {
        throw new Error(response.error?.message || 'Kayıt başarısız');
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Kayıt olurken bir hata oluştu');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.success('Çıkış yapıldı');
      navigate('/login');
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      const response = await userService.updateMe(data);
      
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        toast.success('Profil güncellendi');
      } else {
        throw new Error(response.error?.message || 'Güncelleme başarısız');
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Profil güncellenirken bir hata oluştu');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await userService.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

