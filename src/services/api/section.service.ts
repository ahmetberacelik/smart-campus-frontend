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
   * instructorId parametresi User ID olarak gönderilir, backend'de instructorUserId olarak işlenir
   */
  async getSections(params?: SectionListParams): Promise<ApiResponse<CourseSection[]>> {
    const queryParams = new URLSearchParams();
    if (params?.semester) queryParams.append('semester', params.semester);
    if (params?.year) queryParams.append('year', params.year.toString());
    // instructorId User ID olarak gönderiliyor, backend'de instructorUserId olarak işleniyor
    if (params?.instructorId) queryParams.append('instructorUserId', params.instructorId.toString());

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
   * Course'a ait section'lar
   */
  async getSectionsByCourse(courseId: string | number): Promise<ApiResponse<CourseSection[]>> {
    const response = await httpClient.get<ApiResponse<CourseSection[]>>(
      `${API_ENDPOINTS.SECTIONS.LIST}/course/${courseId}`
    );
    return response.data;
  },

  /**
   * Instructor User ID'ye göre section'ları getirir
   */
  async getSectionsByInstructorUserId(instructorUserId: string | number): Promise<ApiResponse<CourseSection[]>> {
    const response = await httpClient.get<ApiResponse<CourseSection[]>>(
      `${API_ENDPOINTS.SECTIONS.LIST}/instructor/${instructorUserId}`
    );
    return response.data;
  },

  /**
   * Öğretim üyesinin kendi ders bölümlerini getirir (my-sections)
   */
  async getMySections(semester: string, year: number): Promise<ApiResponse<CourseSection[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('semester', semester);
    queryParams.append('year', year.toString());
    
    const url = `${API_ENDPOINTS.SECTIONS.MY_SECTIONS}?${queryParams.toString()}`;
    const response = await httpClient.get<ApiResponse<CourseSection[]>>(url);
    return response.data;
  },

  /**
   * Belirli semester ve year için tüm ders bölümlerini getirir
   * /sections/semester/list endpoint'ini kullanır
   */
  async getSectionsBySemester(semester: string, year: number): Promise<ApiResponse<CourseSection[]>> {
    // Backend'de /sections/semester/list endpoint'i var ve semester/year parametreleri alıyor
    const queryParams = new URLSearchParams();
    queryParams.append('semester', semester);
    queryParams.append('year', year.toString());
    
    const url = `${API_ENDPOINTS.SECTIONS.LIST}/semester/list?${queryParams.toString()}`;
    
    try {
      const response = await httpClient.get<ApiResponse<CourseSection[]>>(url);
      return response.data;
    } catch (error: any) {
      // 403 hatası (yetki sorunu) ise error fırlat
      if (error?.response?.status === 403) {
        throw error;
      }
      throw error;
    }
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
   * Section güncelleme (admin/faculty)
   */
  async updateSection(
    id: string | number,
    data: { instructorId?: number | string; capacity?: number; scheduleJson?: string }
  ): Promise<ApiResponse<CourseSection>> {
    const response = await httpClient.put<ApiResponse<CourseSection>>(
      API_ENDPOINTS.SECTIONS.UPDATE(id.toString()),
      data
    );
    return response.data;
  },

  /**
   * Database'de mevcut olan tüm yılları getirir
   */
  async getAvailableYears(): Promise<ApiResponse<number[]>> {
    const response = await httpClient.get<ApiResponse<number[]>>(`${API_ENDPOINTS.SECTIONS.LIST}/years`);
    return response.data;
  },

  /**
   * Section silme (admin only)
   */
  async deleteSection(id: string | number): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.SECTIONS.DELETE(id.toString())
    );
    return response.data;
  },
};

