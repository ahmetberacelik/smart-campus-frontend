/**
 * Axios API Client
 * Token refresh için race condition önleme mekanizması içerir
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { ApiResponse, ApiError } from '@/types/api.types';

// Bekleyen istekleri tutan tip
type FailedRequest = {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
};

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: FailedRequest[] = [];

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

  // Bekleyen istekleri işle
  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((request) => {
      if (error) {
        request.reject(error);
      } else {
        request.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  // JWT token'ı decode et (debug için)
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  private setupInterceptors() {
    // Request interceptor - Token ekleme
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          // Debug: Token içeriğini logla
          const decoded = this.decodeToken(token);
          console.log('🔑 Request with token:', {
            url: config.url,
            tokenPayload: decoded,
            role: decoded?.role,
            exp: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
          });
        } else {
          console.warn('⚠️ Request without token:', config.url);
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
          // Zaten refresh yapılıyorsa, bu isteği kuyruğa ekle
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            
            if (newToken) {
              // Kuyruktaki tüm istekleri yeni token ile işle
              this.processQueue(null, newToken);
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.client(originalRequest);
            } else {
              // Token alınamadı - tüm bekleyen istekleri reddet
              this.processQueue(error, null);
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // Refresh başarısız - tüm bekleyen istekleri reddet
            this.processQueue(refreshError, null);
            console.warn('Token refresh failed:', refreshError);
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        // 401 hatası ve retry zaten yapıldıysa sadece hatayı döndür
        if (error.response?.status === 401) {
          return Promise.reject(error);
        }

        // Error response'u standart formata çevir
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
    console.log('🔄 Attempting token refresh...', { 
      hasRefreshToken: !!refreshToken,
      refreshTokenPreview: refreshToken ? refreshToken.substring(0, 20) + '...' : 'null'
    });
    
    if (!refreshToken) {
      console.warn('❌ No refresh token available');
      return null;
    }

    try {
      const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>(
        `${API_CONFIG.BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      console.log('🔄 Refresh response:', {
        success: response.data.success,
        hasData: !!response.data.data,
        fullResponse: response.data
      });

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Yeni token'ı decode et ve logla
        const decoded = this.decodeToken(accessToken);
        console.log('✅ Token refreshed successfully:', {
          newTokenPayload: decoded,
          role: decoded?.role,
          exp: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
        });
        
        // Eğer yeni refresh token geliyorsa onu da güncelle
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
          console.log('✅ New refresh token saved');
        }
        return accessToken;
      }
      console.warn('❌ Refresh response invalid');
      return null;
    } catch (error: any) {
      console.warn('❌ Token refresh failed:', {
        status: error?.response?.status,
        message: error?.message,
        responseData: error?.response?.data
      });
      return null;
    }
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

