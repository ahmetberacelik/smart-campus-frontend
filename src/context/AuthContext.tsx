/**
 * Authentication Context
 * Kullanıcı authentication state'ini yönetir
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '@/services/api';
import type { User, LoginRequest, RegisterRequest, ApiError } from '@/types/api.types';
import { toast } from 'react-toastify';

const getDisplayName = (user?: Partial<User>) =>
  user?.name ||
  [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
  '';

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
        const accessToken = localStorage.getItem('accessToken');
        
        // Token yoksa direkt çık
        if (!accessToken || !storedUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        const parsedUser = JSON.parse(storedUser);
        // Eğer isim alanı yoksa oluştur
        const normalizedUser = {
          ...parsedUser,
          name: getDisplayName(parsedUser),
          profilePictureUrl:
            parsedUser.profilePicture || parsedUser.profilePictureUrl,
          phone: parsedUser.phoneNumber || parsedUser.phone,
        };
        setUser(normalizedUser);
        
        // Token geçerli mi kontrol et (opsiyonel - arka planda güncelle)
        try {
          const response = await userService.getMe();
          if (response.success && response.data) {
            // Kullanıcı bilgilerini güncelle
            const updatedUser = {
              ...response.data,
              name: getDisplayName(response.data),
              profilePictureUrl:
                response.data.profilePicture || response.data.profilePictureUrl,
              phone: response.data.phoneNumber || response.data.phone,
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (error: any) {
          // 401 hatası ve token refresh de başarısız olduysa temizle
          // Ama sadece gerçekten oturum sonlandıysa (refreshToken da geçersizse)
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            console.log('No refresh token, clearing session');
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            setUser(null);
          } else {
            // Token refresh mekanizması zaten client.ts'de var
            // Burada sadece warning log atalım
            console.warn('Initial auth check failed, token refresh will handle it:', error?.message);
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
        const normalizedUser = {
          ...response.data.user,
          name: getDisplayName(response.data.user),
          profilePictureUrl:
            response.data.user.profilePicture || response.data.user.profilePictureUrl,
          phone:
            response.data.user.phoneNumber || response.data.user.phone,
        } as User;
        setUser(normalizedUser);
        toast.success('Giriş başarılı!');
        navigate('/dashboard');
      } else {
        throw new Error(response.error?.message || 'Giriş başarısız');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Giriş yapılırken bir hata oluştu';
      
      // Email doğrulama hatası için özel mesaj
      if (apiError.code === 'EMAIL_NOT_VERIFIED' || errorMessage.includes('doğrulanmamış')) {
        toast.error('Email adresiniz doğrulanmamış. Lütfen email adresinizi kontrol edin.');
      } else {
        toast.error(errorMessage);
      }
      
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

