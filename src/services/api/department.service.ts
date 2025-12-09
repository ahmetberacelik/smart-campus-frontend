/**
 * Department Service
 * Bölüm bilgilerini backend'den çeker
 */

import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse } from '@/types/api.types';

export interface Department {
  id: number;
  name: string;
  code: string;
  facultyName: string;
}

export const departmentService = {
  /**
   * Tüm bölümleri getir
   */
  async getDepartments(): Promise<ApiResponse<Department[]>> {
    const response = await apiClient.get<ApiResponse<Department[]>>(
      API_ENDPOINTS.DEPARTMENTS.LIST
    );
    return response.data;
  },

  /**
   * Bölüm detayı (ID ile)
   */
  async getDepartmentById(id: number): Promise<ApiResponse<Department>> {
    const response = await apiClient.get<ApiResponse<Department>>(
      API_ENDPOINTS.DEPARTMENTS.DETAIL(id.toString())
    );
    return response.data;
  },

  /**
   * Bölüm detayı (Kod ile)
   */
  async getDepartmentByCode(code: string): Promise<ApiResponse<Department>> {
    const response = await apiClient.get<ApiResponse<Department>>(
      API_ENDPOINTS.DEPARTMENTS.BY_CODE(code)
    );
    return response.data;
  },
};

