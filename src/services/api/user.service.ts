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

const buildDisplayName = (user: Partial<User>) =>
  user.name ||
  [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

export const userService = {
  /**
   * Kendi profil bilgilerini getir
   */
  async getMe(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.USERS.ME
    );

    if (response.data.success && response.data.data) {
      const user = response.data.data;
      const normalizedUser = {
        ...user,
        name: buildDisplayName(user),
        profilePictureUrl: user.profilePicture || user.profilePictureUrl,
        phone: user.phoneNumber || user.phone,
      };
      response.data.data = normalizedUser as User;
    }

    return response.data;
  },

  /**
   * Profil güncelle
   */
  async updateMe(data: Partial<User>): Promise<ApiResponse<User>> {
    // Frontend alanlarını backend beklediği alanlara çevir
    const payload: Record<string, any> = {
      phoneNumber: data.phone ?? data.phoneNumber,
    };

    if (data.firstName || data.lastName || data.name) {
      if (data.firstName || data.lastName) {
        payload.firstName = data.firstName;
        payload.lastName = data.lastName;
      } else if (data.name) {
        const parts = data.name.split(' ');
        payload.firstName = parts.slice(0, -1).join(' ') || parts[0];
        payload.lastName = parts.slice(-1).join(' ') || '';
      }
    }

    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UPDATE_ME,
      payload
    );

    if (response.data.success && response.data.data) {
      const user = response.data.data;
      const normalizedUser = {
        ...user,
        name: buildDisplayName(user),
        profilePictureUrl: user.profilePicture || user.profilePictureUrl,
        phone: user.phoneNumber || user.phone,
      };
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      response.data.data = normalizedUser as User;
    }

    return response.data;
  },

  /**
   * Profil fotoğrafı yükle
   */
  async uploadProfilePicture(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<string | { url: string }>>(
      API_ENDPOINTS.USERS.PROFILE_PICTURE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Backend sadece string dönerse normalize et
    if (response.data.success) {
      if (typeof response.data.data === 'string') {
        response.data.data = { url: response.data.data };
      }
    }

    return response.data as ApiResponse<{ url: string }>;
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

