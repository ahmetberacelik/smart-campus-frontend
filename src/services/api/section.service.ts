/**
 * Course Section Service
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse, CourseSection } from '@/types/api.types';

export interface SectionListParams {
  semester?: string;
  year?: number;
  instructorId?: number | string;
}

export interface CreateSectionRequest {
  courseId: number | string;
  sectionNumber: string;
  semester: string;
  year: number;
  instructorId: number | string;
  capacity: number;
  scheduleJson?: string;
  classroomId?: number | string;
}

export const sectionService = {
  /**
   * Section listesi (filtering by semester, instructor)
   */
  async getSections(params?: SectionListParams): Promise<ApiResponse<CourseSection[]>> {
    const queryParams = new URLSearchParams();
    if (params?.semester) queryParams.append('semester', params.semester);
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.instructorId) queryParams.append('instructorId', params.instructorId.toString());

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.SECTIONS.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.SECTIONS.LIST;

    const response = await httpClient.get<ApiResponse<CourseSection[]>>(url);
    return response.data;
  },

  /**
   * Section detayları
   */
  async getSectionById(id: string | number): Promise<ApiResponse<CourseSection>> {
    const response = await httpClient.get<ApiResponse<CourseSection>>(
      API_ENDPOINTS.SECTIONS.DETAIL(id.toString())
    );
    return response.data;
  },

  /**
   * Section oluşturma (admin)
   */
  async createSection(data: CreateSectionRequest): Promise<ApiResponse<CourseSection>> {
    const response = await httpClient.post<ApiResponse<CourseSection>>(
      API_ENDPOINTS.SECTIONS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Section güncelleme (admin)
   */
  async updateSection(
    id: string | number,
    data: CreateSectionRequest
  ): Promise<ApiResponse<CourseSection>> {
    const response = await httpClient.put<ApiResponse<CourseSection>>(
      API_ENDPOINTS.SECTIONS.UPDATE(id.toString()),
      data
    );
    return response.data;
  },
};

