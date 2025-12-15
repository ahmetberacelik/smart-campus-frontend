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
            // Refresh token da geçersizse sadece hata döndür, logout yapma
            console.warn('Token refresh failed:', refreshError);
          }
          
          // Token yenilenemedi, ama logout yapmayalım - component'ler kendi hata yönetimini yapsın
          // Sadece hatayı reject et, böylece sayfa kendi hata UI'ını gösterebilir
          return Promise.reject(error);
        }

        // 401 hatası ve retry zaten yapıldıysa sadece hatayı döndür
        if (error.response?.status === 401) {
          // Logout yapma, component'ler kendi yönetimini yapsın
          return Promise.reject(error);
        }

        // Error response'u standart formata çevir
        // Backend'den gelen mesajı önce message field'ından, sonra error.message'dan al
        const backendMessage = error.response?.data?.message || error.response?.data?.error?.message;
        const apiError: ApiError = {
          code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
          message: backendMessage || error.message || 'Bir hata oluştu',
          details: error.response?.data?.error?.details,
        };

        // Error response'u logla (debug için)
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: apiError.message,
          code: apiError.code,
        });

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
    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }

    try {
      const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>(
        `${API_CONFIG.BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        // Eğer yeni refresh token geliyorsa onu da güncelle
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        console.log('Token refreshed successfully');
        return accessToken;
      }
      return null;
    } catch (error: any) {
      console.warn('Token refresh failed:', error?.response?.status, error?.message);
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

