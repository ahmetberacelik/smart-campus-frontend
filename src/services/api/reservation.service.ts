/**
 * Reservation Service
 * Sınıf rezervasyon sistemi API entegrasyonu
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse, PaginationParams } from '@/types/api.types';

export interface Classroom {
  id: string;
  name: string;
  building: string;
  capacity: number;
  floor?: number;
  equipment?: string[];
  roomNumber?: string;
  hasProjector?: boolean;
  hasAirConditioning?: boolean;
}

export interface ClassroomReservation {
  id: string;
  classroomId: string;
  classroomName?: string;
  classroom?: Classroom;
  date: string;
  reservationDate?: string;
  startTime: string;
  endTime: string;
  purpose: string;
  requesterId: string;
  requesterName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  createdAt: string;
}

export interface CreateReservationRequest {
  classroomId: number;          // Backend: Long classroomId
  reservationDate: string;      // Backend: LocalDate reservationDate (YYYY-MM-DD format)
  startTime: string;            // Backend: LocalTime startTime (HH:mm format)
  endTime: string;              // Backend: LocalTime endTime (HH:mm format)
  purpose: string;              // Backend: String purpose
  notes?: string;               // Backend: String notes (optional)
}

export interface ReservationListParams extends PaginationParams {
  building?: string;
  capacity?: number;
  date?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const reservationService = {
  /**
   * Sınıf listesi (Backend: /api/v1/classrooms)
   */
  async getClassrooms(params?: ReservationListParams): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('size', params.limit.toString());

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.CLASSROOMS.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.CLASSROOMS.LIST;

    const response = await httpClient.get<ApiResponse<any>>(url);
    return response.data;
  },

  /**
   * Binalara göre sınıf listesi
   */
  async getClassroomsByBuilding(building: string): Promise<ApiResponse<any>> {
    const response = await httpClient.get<ApiResponse<any>>(
      API_ENDPOINTS.CLASSROOMS.BY_BUILDING(building)
    );
    return response.data;
  },

  /**
   * Bina listesi
   */
  async getBuildings(): Promise<ApiResponse<string[]>> {
    const response = await httpClient.get<ApiResponse<string[]>>(
      API_ENDPOINTS.CLASSROOMS.BUILDINGS
    );
    return response.data;
  },

  /**
   * Rezervasyon oluşturma (Backend: POST /api/v1/classroom-reservations)
   */
  async createReservation(data: CreateReservationRequest): Promise<ApiResponse<ClassroomReservation>> {
    const response = await httpClient.post<ApiResponse<ClassroomReservation>>(
      API_ENDPOINTS.RESERVATIONS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Benim rezervasyonlarım (Backend: GET /api/v1/classroom-reservations/my)
   */
  async getMyReservations(): Promise<ApiResponse<ClassroomReservation[]>> {
    const response = await httpClient.get<ApiResponse<ClassroomReservation[]>>(
      API_ENDPOINTS.RESERVATIONS.LIST
    );
    return response.data;
  },

  /**
   * Rezarvasyon listesi (compat alias)
   */
  async getReservations(_params?: ReservationListParams): Promise<ApiResponse<any>> {
    return this.getMyReservations();
  },

  /**
   * Onay bekleyen rezervasyonlar (Admin only)
   */
  async getPendingReservations(): Promise<ApiResponse<any>> {
    const response = await httpClient.get<ApiResponse<any>>(
      API_ENDPOINTS.RESERVATIONS.PENDING
    );
    return response.data;
  },

  /**
   * Belirli sınıfın rezervasyonları
   */
  async getReservationsByClassroom(classroomId: string, date: string): Promise<ApiResponse<ClassroomReservation[]>> {
    const response = await httpClient.get<ApiResponse<ClassroomReservation[]>>(
      `${API_ENDPOINTS.RESERVATIONS.BY_CLASSROOM(classroomId)}?date=${date}`
    );
    return response.data;
  },

  /**
   * Müsaitlik kontrolü
   */
  async getAvailableSlots(classroomId: string, date: string): Promise<ApiResponse<ClassroomReservation[]>> {
    const response = await httpClient.get<ApiResponse<ClassroomReservation[]>>(
      `${API_ENDPOINTS.RESERVATIONS.AVAILABLE}?classroomId=${classroomId}&date=${date}`
    );
    return response.data;
  },

  /**
   * Rezervasyon onayla (Admin)
   */
  async approveReservation(id: string): Promise<ApiResponse<ClassroomReservation>> {
    const response = await httpClient.post<ApiResponse<ClassroomReservation>>(
      API_ENDPOINTS.RESERVATIONS.APPROVE(id)
    );
    return response.data;
  },

  /**
   * Rezervasyon reddet (Admin)
   */
  async rejectReservation(id: string, reason: string): Promise<ApiResponse<ClassroomReservation>> {
    const url = `${API_ENDPOINTS.RESERVATIONS.REJECT(id)}?reason=${encodeURIComponent(reason)}`;
    const response = await httpClient.post<ApiResponse<ClassroomReservation>>(url);
    return response.data;
  },
};


