/**
 * Event Service
 * Etkinlik yönetimi API entegrasyonu
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse, PaginationParams } from '@/types/api.types';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  category: 'CONFERENCE' | 'WORKSHOP' | 'SOCIAL' | 'SPORTS';
  capacity?: number;
  registeredCount?: number;
  price?: number;
  registrationDeadline?: string;
  imageUrl?: string;
  qrCode?: string;
  customFields?: CustomField[];
}

export interface CustomField {
  id: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'EMAIL' | 'SELECT';
  required: boolean;
  options?: string[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  qrCode: string;
  status: 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED';
  customFieldResponses?: Record<string, string>;
  createdAt: string;
}

export interface RegisterEventRequest {
  eventId: string;
  customFieldResponses?: Record<string, string>;
}

export interface EventListParams extends PaginationParams {
  category?: string;
  search?: string;
  upcoming?: boolean;
}

export const eventService = {
  /**
   * Etkinlik listesi
   * Backend'de Pageable döndürüyor, page ve size parametreleri ile
   */
  async getEvents(params?: EventListParams): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('size', params.limit.toString());
    // Backend'de category için ayrı endpoint var: /category/{category}
    // Search için ayrı endpoint var: /search?q=...
    // Upcoming için ayrı endpoint var: /upcoming
    // Şimdilik genel list endpoint'ini kullanıyoruz (upcoming events döndürüyor)

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.EVENTS.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.EVENTS.LIST;

    const response = await httpClient.get<ApiResponse<any>>(url);
    return response.data;
  },

  /**
   * Etkinlik detayı
   */
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    const response = await httpClient.get<ApiResponse<Event>>(
      API_ENDPOINTS.EVENTS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Etkinliğe kayıt olma
   */
  async registerEvent(data: RegisterEventRequest): Promise<ApiResponse<EventRegistration>> {
    const response = await httpClient.post<ApiResponse<EventRegistration>>(
      API_ENDPOINTS.EVENTS.REGISTER(data.eventId),
      data
    );
    return response.data;
  },

  /**
   * Kayıt iptali
   * Backend'de DELETE /{eventId}/register endpoint'i var (registrationId gerekmiyor)
   */
  async cancelRegistration(eventId: string): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(
      `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/register`
    );
    return response.data;
  },

  /**
   * Etkinlik kayıtlarım (kayıt olduğum etkinlikler)
   * Backend'de /my-registrations endpoint'i var
   */
  async getMyEvents(): Promise<ApiResponse<EventRegistration[]>> {
    const response = await httpClient.get<ApiResponse<EventRegistration[]>>(
      '/events/my-registrations'
    );
    return response.data;
  },

  /**
   * QR kod ile check-in (event manager)
   * Backend'de POST /check-in/{qrCode} endpoint'i var (path parameter olarak qrCode)
   */
  async checkIn(qrCode: string): Promise<ApiResponse<any>> {
    const response = await httpClient.post<ApiResponse<any>>(
      `/events/check-in/${encodeURIComponent(qrCode)}`
    );
    return response.data;
  },

  /**
   * QR kod ile kayıt sorgula (event manager)
   * Backend'de GET /registration/qr/{qrCode} endpoint'i var
   */
  async getRegistrationByQrCode(qrCode: string): Promise<ApiResponse<any>> {
    const response = await httpClient.get<ApiResponse<any>>(
      `/events/registration/qr/${encodeURIComponent(qrCode)}`
    );
    return response.data;
  },
};

