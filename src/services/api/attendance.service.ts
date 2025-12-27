/**
 * Attendance Service
 * GPS tabanlı yoklama sistemi için API entegrasyonu
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse, AttendanceSession, AttendanceRecord, AttendanceStats, ExcuseRequest, PaginationParams } from '@/types/api.types';

export interface CreateAttendanceSessionRequest {
  sectionId: number | string;
  date: string; // ISO date string
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  geofenceRadius?: number; // Metre cinsinden, varsayılan 15m
}

export interface CheckInRequest {
  latitude: number;
  longitude: number;
  accuracy?: number; // GPS doğruluğu (metre cinsinden)
}

export interface CheckInQrRequest {
  qrCode: string;
  latitude?: number; // Opsiyonel - QR kod zaten güvenli olduğu için
  longitude?: number; // Opsiyonel
  accuracy?: number;
  deviceInfo?: string;
  isMockLocation?: boolean;
}

export interface CreateExcuseRequest {
  sessionId: number | string;
  reason: string;
  documentUrl?: string;
}

export interface AttendanceReportParams extends PaginationParams {
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface ExcuseRequestListParams extends PaginationParams {
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

export const attendanceService = {
  // ========== Faculty Endpoints ==========

  /**
   * Yoklama oturumu açma (faculty)
   */
  async createSession(data: CreateAttendanceSessionRequest): Promise<ApiResponse<AttendanceSession>> {
    const response = await httpClient.post<ApiResponse<AttendanceSession>>(
      API_ENDPOINTS.ATTENDANCE.SESSIONS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Oturum detayları
   */
  async getSessionById(id: string | number): Promise<ApiResponse<AttendanceSession>> {
    const response = await httpClient.get<ApiResponse<AttendanceSession>>(
      API_ENDPOINTS.ATTENDANCE.SESSIONS.DETAIL(id.toString())
    );
    return response.data;
  },

  /**
   * Oturumu kapatma (faculty)
   */
  async closeSession(id: string | number): Promise<ApiResponse<void>> {
    const response = await httpClient.put<ApiResponse<void>>(
      API_ENDPOINTS.ATTENDANCE.SESSIONS.CLOSE(id.toString()),
      {}
    );
    return response.data;
  },

  /**
   * Benim oturumlarım (faculty)
   */
  async getMySessions(): Promise<ApiResponse<AttendanceSession[]>> {
    const response = await httpClient.get<ApiResponse<AttendanceSession[]>>(
      API_ENDPOINTS.ATTENDANCE.SESSIONS.MY_SESSIONS
    );
    return response.data;
  },

  /**
   * Yoklama raporu (faculty)
   */
  async getAttendanceReport(
    sectionId: string | number,
    params?: AttendanceReportParams
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('size', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.direction) queryParams.append('direction', params.direction);

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.ATTENDANCE.REPORT(sectionId.toString())}?${queryParams.toString()}`
      : API_ENDPOINTS.ATTENDANCE.REPORT(sectionId.toString());

    const response = await httpClient.get<ApiResponse<any>>(url);
    return response.data;
  },

  // ========== Student Endpoints ==========

  /**
   * Yoklama verme (student) - GPS koordinatları ile
   */
  async checkIn(sessionId: string | number, data: CheckInRequest): Promise<ApiResponse<AttendanceRecord>> {
    const response = await httpClient.post<ApiResponse<AttendanceRecord>>(
      API_ENDPOINTS.ATTENDANCE.CHECKIN(sessionId.toString()),
      data
    );
    return response.data;
  },

  /**
   * Yoklama verme (student) - QR kod ile
   */
  async checkInWithQr(sessionId: string | number, data: CheckInQrRequest): Promise<ApiResponse<AttendanceRecord>> {
    const response = await httpClient.post<ApiResponse<AttendanceRecord>>(
      API_ENDPOINTS.ATTENDANCE.CHECKIN_QR(sessionId.toString()),
      data
    );
    return response.data;
  },

  /**
   * QR kod yenileme (faculty)
   */
  async refreshQrCode(sessionId: string | number): Promise<ApiResponse<AttendanceSession>> {
    const response = await httpClient.put<ApiResponse<AttendanceSession>>(
      API_ENDPOINTS.ATTENDANCE.SESSIONS.REFRESH_QR(sessionId.toString()),
      {}
    );
    return response.data;
  },

  /**
   * Yoklama durumum (student)
   */
  async getMyAttendance(): Promise<ApiResponse<{ courses: AttendanceStats[] }>> {
    const response = await httpClient.get<ApiResponse<{ courses: AttendanceStats[] }>>(
      API_ENDPOINTS.ATTENDANCE.MY_ATTENDANCE
    );
    return response.data;
  },

  /**
   * Aktif yoklama oturumları (student) - Öğrencinin kayıtlı olduğu derslerin aktif oturumları
   */
  async getActiveSessionsForStudent(): Promise<ApiResponse<AttendanceSession[]>> {
    const response = await httpClient.get<ApiResponse<AttendanceSession[]>>(
      API_ENDPOINTS.ATTENDANCE.ACTIVE_SESSIONS
    );
    return response.data;
  },

  // ========== Excuse Requests ==========

  /**
   * Mazeret bildirme (student)
   */
  async createExcuseRequest(data: CreateExcuseRequest): Promise<ApiResponse<ExcuseRequest>> {
    const response = await httpClient.post<ApiResponse<ExcuseRequest>>(
      API_ENDPOINTS.ATTENDANCE.EXCUSE_REQUESTS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Mazeret listesi (faculty)
   */
  async getExcuseRequests(params?: ExcuseRequestListParams): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('size', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.direction) queryParams.append('direction', params.direction);

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.ATTENDANCE.EXCUSE_REQUESTS.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.ATTENDANCE.EXCUSE_REQUESTS.LIST;

    const response = await httpClient.get<ApiResponse<any>>(url);
    return response.data;
  },

  /**
   * Mazeret onaylama (faculty)
   */
  async approveExcuseRequest(id: string | number): Promise<ApiResponse<ExcuseRequest>> {
    const response = await httpClient.put<ApiResponse<ExcuseRequest>>(
      API_ENDPOINTS.ATTENDANCE.EXCUSE_REQUESTS.APPROVE(id.toString()),
      {}
    );
    return response.data;
  },

  /**
   * Mazeret reddetme (faculty)
   */
  async rejectExcuseRequest(id: string | number, notes?: string): Promise<ApiResponse<ExcuseRequest>> {
    const response = await httpClient.put<ApiResponse<ExcuseRequest>>(
      API_ENDPOINTS.ATTENDANCE.EXCUSE_REQUESTS.REJECT(id.toString()),
      notes ? { notes } : {}
    );
    return response.data;
  },
};

