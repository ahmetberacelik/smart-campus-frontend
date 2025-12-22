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
}

export interface ClassroomReservation {
  id: string;
  classroomId: string;
  classroom: Classroom;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  requesterId: string;
  requesterName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface CreateReservationRequest {
  classroomId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
}

export interface ReservationListParams extends PaginationParams {
  building?: string;
  capacity?: number;
  date?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const reservationService = {
  /**
   * Sınıf listesi
   */
  async getClassrooms(params?: ReservationListParams): Promise<ApiResponse<Classroom[]>> {
    const queryParams = new URLSearchParams();
    if (params?.building) queryParams.append('building', params.building);
    if (params?.capacity) queryParams.append('capacity', params.capacity.toString());
    if (params?.date) queryParams.append('date', params.date);

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.RESERVATIONS.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.RESERVATIONS.LIST;

    const response = await httpClient.get<ApiResponse<Classroom[]>>(url);
    return response.data;
  },

  /**
   * Rezervasyon oluşturma
   */
  async createReservation(data: CreateReservationRequest): Promise<ApiResponse<ClassroomReservation>> {
    const response = await httpClient.post<ApiResponse<ClassroomReservation>>(
      API_ENDPOINTS.RESERVATIONS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Rezervasyon listesi
   */
  async getReservations(params?: ReservationListParams): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('size', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.RESERVATIONS.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.RESERVATIONS.LIST;

    const response = await httpClient.get<ApiResponse<any>>(url);
    return response.data;
  },
};

