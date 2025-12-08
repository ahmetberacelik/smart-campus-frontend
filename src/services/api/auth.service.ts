/**
 * Authentication Service
 * Backend hazır olduğunda bu dosyada değişiklik yapmaya gerek yok
 */

import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from '@/types/api.types';

export const authService = {
  /**
   * Kullanıcı kaydı
   */
  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  /**
   * Kullanıcı girişi
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Token'ları localStorage'a kaydet
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      apiClient.setAuthTokens(accessToken, refreshToken);
      
      // User bilgisini de kaydet
      if (response.data.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    }
    
    return response.data;
  },

  /**
   * Çıkış yapma
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Hata olsa bile token'ları temizle
      console.error('Logout error:', error);
    } finally {
      apiClient.clearAuthTokens();
    }
  },

  /**
   * Email doğrulama
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      { token }
    );
    return response.data;
  },

  /**
   * Şifre sıfırlama isteği
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response.data;
  },

  /**
   * Şifre sıfırlama
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, newPassword }
    );
    return response.data;
  },

  /**
   * Token yenileme
   */
  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    if (response.data.success && response.data.data) {
      apiClient.setAuthTokens(response.data.data.accessToken, refreshToken);
    }

    return response.data;
  },
};

