/**
 * Axios API Client
 * Backend hazır olduğunda bu dosyada değişiklik yapmaya gerek yok
 * Sadece API_CONFIG'deki BASE_URL'i güncellemeniz yeterli
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { ApiResponse, ApiError } from '@/types/api.types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Token ekleme
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Error handling ve token refresh
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 401 Unauthorized - Token yenileme dene
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh token da geçersizse logout
            this.handleLogout();
            return Promise.reject(refreshError);
          }
        }

        // Error response'u standart formata çevir
        const apiError: ApiError = {
          code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
          message: error.response?.data?.error?.message || error.message || 'Bir hata oluştu',
          details: error.response?.data?.error?.details,
        };

        return Promise.reject(apiError);
      }
    );
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await axios.post<ApiResponse<{ accessToken: string }>>(
        `${API_CONFIG.BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      if (response.data.success && response.data.data) {
        const newAccessToken = response.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Redirect to login - React Router kullanıyorsanız navigate kullanın
    window.location.href = '/login';
  }

  // Public methods
  getInstance(): AxiosInstance {
    return this.client;
  }

  setAuthTokens(accessToken: string, refreshToken: string) {
    this.setTokens(accessToken, refreshToken);
  }

  clearAuthTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Singleton instance
export const apiClient = new ApiClient();
export default apiClient.getInstance();

