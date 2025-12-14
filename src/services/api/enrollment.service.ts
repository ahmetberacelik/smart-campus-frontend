/**
 * Enrollment Service
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse, Enrollment, PaginationParams } from '@/types/api.types';

export interface EnrollRequest {
  sectionId: number | string;
}

export interface SectionStudentsParams extends PaginationParams {
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

export const enrollmentService = {
  /**
   * Derse kayıt olma (student)
   */
  async enroll(data: EnrollRequest): Promise<ApiResponse<Enrollment>> {
    const response = await httpClient.post<ApiResponse<Enrollment>>(
      API_ENDPOINTS.ENROLLMENTS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Dersi bırakma (student)
   */
  async dropEnrollment(id: string | number): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.ENROLLMENTS.DELETE(id.toString())
    );
    return response.data;
  },

  /**
   * Kayıtlı derslerim (student)
   */
  async getMyCourses(): Promise<ApiResponse<Enrollment[]>> {
    const response = await httpClient.get<ApiResponse<Enrollment[]>>(
      API_ENDPOINTS.ENROLLMENTS.MY_COURSES
    );
    return response.data;
  },

  /**
   * Dersin öğrenci listesi (faculty)
   */
  async getSectionStudents(
    sectionId: string | number,
    params?: SectionStudentsParams
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('size', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.direction) queryParams.append('direction', params.direction);

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.ENROLLMENTS.STUDENTS(sectionId.toString())}?${queryParams.toString()}`
      : API_ENDPOINTS.ENROLLMENTS.STUDENTS(sectionId.toString());

    const response = await httpClient.get<ApiResponse<any>>(url);
    return response.data;
  },
};

