/**
 * Course Service
 * Backend API ile entegrasyon
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse, Course, PaginationParams } from '@/types/api.types';

export interface CourseListParams extends PaginationParams {
  search?: string;
  departmentId?: number | string;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface CreateCourseRequest {
  code: string;
  name: string;
  description?: string;
  credits: number;
  ects: number;
  syllabusUrl?: string;
  departmentId: number | string;
}

export interface UpdateCourseRequest {
  name?: string;
  description?: string;
  credits?: number;
  ects?: number;
  syllabusUrl?: string;
}

export const courseService = {
  /**
   * Ders listesi (pagination, filtering, search)
   */
  async getCourses(params?: CourseListParams): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('size', params.limit.toString());
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.direction) queryParams.append('direction', params.direction);

    const response = await httpClient.get<ApiResponse<any>>(
      `${API_ENDPOINTS.COURSES.LIST}?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Ders arama (search endpoint kullanarak)
   */
  async searchCourses(
    keyword: string,
    page: number = 0,
    limit: number = 20,
    departmentId?: number | string
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    queryParams.append('keyword', keyword);
    queryParams.append('page', page.toString());
    queryParams.append('size', limit.toString());
    if (departmentId) queryParams.append('departmentId', departmentId.toString());

    const response = await httpClient.get<ApiResponse<any>>(
      `${API_ENDPOINTS.COURSES.LIST}/search?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Ders detayları (prerequisites dahil)
   */
  async getCourseById(id: string | number): Promise<ApiResponse<Course>> {
    const response = await httpClient.get<ApiResponse<Course>>(
      API_ENDPOINTS.COURSES.DETAIL(id.toString())
    );
    return response.data;
  },

  /**
   * Yeni ders oluşturma (admin only)
   */
  async createCourse(data: CreateCourseRequest): Promise<ApiResponse<Course>> {
    const response = await httpClient.post<ApiResponse<Course>>(
      API_ENDPOINTS.COURSES.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Ders güncelleme (admin only)
   */
  async updateCourse(id: string | number, data: UpdateCourseRequest): Promise<ApiResponse<Course>> {
    const response = await httpClient.put<ApiResponse<Course>>(
      API_ENDPOINTS.COURSES.UPDATE(id.toString()),
      data
    );
    return response.data;
  },

  /**
   * Ders silme (soft delete, admin only)
   */
  async deleteCourse(id: string | number): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.COURSES.DELETE(id.toString())
    );
    return response.data;
  },
};

