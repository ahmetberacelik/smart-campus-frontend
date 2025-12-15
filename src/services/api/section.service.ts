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
   * Course'a ait section'lar
   */
  async getSectionsByCourse(courseId: string | number): Promise<ApiResponse<CourseSection[]>> {
    const response = await httpClient.get<ApiResponse<CourseSection[]>>(
      `/sections/course/${courseId}`
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
    
    const url = `/sections/semester/list?${queryParams.toString()}`;
    console.log('🔍 getSectionsBySemester çağrılıyor:', url);
    console.log('🔍 Full URL will be:', `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}${url}`);
    
    try {
      const response = await httpClient.get<ApiResponse<CourseSection[]>>(url);
      
      console.log('✅ getSectionsBySemester başarılı:', response.data?.data?.length || 0, 'section bulundu');
      console.log('✅ Response data:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ getSectionsBySemester hatası:', error);
      console.error('❌ Error response:', error?.response);
      console.error('❌ Error status:', error?.response?.status);
      console.error('❌ Error data:', error?.response?.data);
      console.error('❌ Request URL:', error?.config?.url);
      console.error('❌ Request method:', error?.config?.method);
      
      // 403 hatası (yetki sorunu) ise boş array dön, diğer hataları fırlat
      if (error?.response?.status === 403) {
        console.warn('⚠️ 403 Forbidden - Yetki hatası');
        // Error'ı fırlat ki UI'da gösterilebilsin
        throw error;
      }
      
      // Diğer hatalar için error fırlat
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

  /**
   * Database'de mevcut olan tüm yılları getirir
   */
  async getAvailableYears(): Promise<ApiResponse<number[]>> {
    const response = await httpClient.get<ApiResponse<number[]>>('/sections/years');
    return response.data;
  },
};

