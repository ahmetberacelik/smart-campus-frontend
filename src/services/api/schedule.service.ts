/**
 * Schedule Service
 * Ders programı yönetimi API entegrasyonu
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse } from '@/types/api.types';

export interface ScheduleEntry {
  id: string;
  sectionId: string;
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  instructorName: string;
  dayOfWeek: number; // 1=Monday, 7=Sunday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
  building: string;
  semester: string;
  year: number;
}

export interface MySchedule {
  semester: string;
  year: number;
  entries: ScheduleEntry[];
}

export interface GenerateScheduleRequest {
  semester: string;
  year: number;
  sectionIds: string[];
}

export interface GeneratedSchedule {
  id: string;
  semester: string;
  year: number;
  entries: ScheduleEntry[];
  conflicts: number;
  score: number;
}

// Yeni: Schedule CRUD için tipler
export interface ScheduleResponse {
  id: number;
  sectionId: number;
  sectionCode: string;
  courseName: string;
  courseCode: string;
  dayOfWeek: string; // MONDAY, TUESDAY, etc.
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  classroomId: number;
  classroomName: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateScheduleRequest {
  sectionId: number;
  dayOfWeek: string; // MONDAY, TUESDAY, etc.
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  classroomId: number;
}

export interface CheckConflictParams {
  classroomId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  excludeId?: number;
}

export const scheduleService = {
  /**
   * Öğrenci ders programı
   */
  async getMySchedule(): Promise<ApiResponse<MySchedule>> {
    const response = await httpClient.get<ApiResponse<MySchedule>>(
      API_ENDPOINTS.SCHEDULING.MY_SCHEDULE
    );
    return response.data;
  },

  /**
   * iCal export
   */
  async getMyScheduleICal(): Promise<Blob> {
    const response = await httpClient.get(API_ENDPOINTS.SCHEDULING.MY_SCHEDULE_ICAL, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Program oluşturma (admin) - eski otomatik sistem
   */
  async generateSchedule(data: GenerateScheduleRequest): Promise<ApiResponse<GeneratedSchedule[]>> {
    const response = await httpClient.post<ApiResponse<GeneratedSchedule[]>>(
      API_ENDPOINTS.SCHEDULING.GENERATE,
      data
    );
    return response.data;
  },

  // ========== Yeni CRUD Metodları ==========

  /**
   * Tüm programları listele
   */
  async getAllSchedules(): Promise<ApiResponse<ScheduleResponse[]>> {
    const response = await httpClient.get<ApiResponse<ScheduleResponse[]>>('/schedules');
    return response.data;
  },

  /**
   * Program oluştur (admin - manuel)
   */
  async createSchedule(data: CreateScheduleRequest): Promise<ApiResponse<ScheduleResponse>> {
    const response = await httpClient.post<ApiResponse<ScheduleResponse>>('/schedules', data);
    return response.data;
  },

  /**
   * Program güncelle
   */
  async updateSchedule(id: number, data: CreateScheduleRequest): Promise<ApiResponse<ScheduleResponse>> {
    const response = await httpClient.put<ApiResponse<ScheduleResponse>>(`/schedules/${id}`, data);
    return response.data;
  },

  /**
   * Program sil
   */
  async deleteSchedule(id: number): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(`/schedules/${id}`);
    return response.data;
  },

  /**
   * Çakışma kontrolü
   */
  async checkConflict(params: CheckConflictParams): Promise<ApiResponse<{ hasConflict: boolean }>> {
    const response = await httpClient.post<ApiResponse<{ hasConflict: boolean }>>(
      '/schedules/check-conflict',
      null,
      { params }
    );
    return response.data;
  },

  /**
   * Bölüme göre programlar
   */
  async getSchedulesBySection(sectionId: number): Promise<ApiResponse<ScheduleResponse[]>> {
    const response = await httpClient.get<ApiResponse<ScheduleResponse[]>>(`/schedules/section/${sectionId}`);
    return response.data;
  },
};
