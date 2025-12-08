/**
 * User Service
 * Backend hazır olduğunda bu dosyada değişiklik yapmaya gerek yok
 */

import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type {
  ApiResponse,
  User,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api.types';

export const userService = {
  /**
   * Kendi profil bilgilerini getir
   */
  async getMe(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.USERS.ME
    );
    return response.data;
  },

  /**
   * Profil güncelle
   */
  async updateMe(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UPDATE_ME,
      data
    );
    
    // Güncellenmiş user bilgisini localStorage'a kaydet
    if (response.data.success && response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    
    return response.data;
  },

  /**
   * Profil fotoğrafı yükle
   */
  async uploadProfilePicture(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      API_ENDPOINTS.USERS.PROFILE_PICTURE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Kullanıcı listesi (Admin only)
   */
  async getUsers(params?: PaginationParams & {
    role?: string;
    department?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      API_ENDPOINTS.USERS.LIST,
      { params }
    );
    return response.data;
  },
};

