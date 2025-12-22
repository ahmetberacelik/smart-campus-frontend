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
   * Program oluşturma (admin)
   */
  async generateSchedule(data: GenerateScheduleRequest): Promise<ApiResponse<GeneratedSchedule[]>> {
    const response = await httpClient.post<ApiResponse<GeneratedSchedule[]>>(
      API_ENDPOINTS.SCHEDULING.GENERATE,
      data
    );
    return response.data;
  },
};

