/**
 * Meal Service
 * Yemek rezervasyon sistemi API entegrasyonu
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse, PaginationParams } from '@/types/api.types';

export interface Menu {
  id: string;
  date: string;
  mealType: 'LUNCH' | 'DINNER';
  items: MenuItem[];
  nutritionalInfo?: NutritionalInfo;
  isPublished?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  isVegan?: boolean;
  isVegetarian?: boolean;
  allergens?: string[];
}

export interface NutritionalInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface MealReservation {
  id: string;
  menuId: string;
  date: string;
  mealType: 'LUNCH' | 'DINNER';
  qrCode: string;
  status: 'RESERVED' | 'USED' | 'CANCELLED';
  createdAt: string;
}

export interface CreateReservationRequest {
  menuId: string;
}

export interface MenuListParams extends PaginationParams {
  date?: string;
  mealType?: 'LUNCH' | 'DINNER';
}

export const mealService = {
  /**
   * Menü listesi
   * Backend'de date parametresi required - bugünün tarihini default olarak gönder
   */
  async getMenus(params?: MenuListParams): Promise<ApiResponse<Menu[]>> {
    const queryParams = new URLSearchParams();
    // Backend'de date required, eğer verilmemişse bugünün tarihini kullan
    const date = params?.date || new Date().toISOString().split('T')[0];
    queryParams.append('date', date);
    if (params?.mealType) queryParams.append('mealType', params.mealType);
    // Backend'de pagination yok, sadece date ve mealType var

    const url = `${API_ENDPOINTS.MEALS.MENUS.LIST}?${queryParams.toString()}`;

    const response = await httpClient.get<ApiResponse<Menu[]>>(url);
    return response.data;
  },

  /**
   * Menü detayı
   */
  async getMenuById(id: string): Promise<ApiResponse<Menu>> {
    const response = await httpClient.get<ApiResponse<Menu>>(
      API_ENDPOINTS.MEALS.MENUS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Rezervasyon oluşturma
   */
  async createReservation(data: CreateReservationRequest): Promise<ApiResponse<MealReservation>> {
    const response = await httpClient.post<ApiResponse<MealReservation>>(
      API_ENDPOINTS.MEALS.RESERVATIONS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Rezervasyon iptali
   */
  async cancelReservation(id: string): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.MEALS.RESERVATIONS.DELETE(id)
    );
    return response.data;
  },

  /**
   * Rezervasyonlarım
   * Backend Pageable döndürüyor, page ve size parametreleri ile
   */
  async getMyReservations(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('size', params.limit.toString());

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.MEALS.RESERVATIONS.MY_RESERVATIONS}?${queryParams.toString()}`
      : API_ENDPOINTS.MEALS.RESERVATIONS.MY_RESERVATIONS;

    const response = await httpClient.get<ApiResponse<any>>(url);
    return response.data;
  },

  /**
   * QR kod ile rezervasyon sorgula (cafeteria staff)
   * Backend'de GET /scan?qrCode=... endpoint'i var
   */
  async scanReservation(qrCode: string): Promise<ApiResponse<any>> {
    const response = await httpClient.get<ApiResponse<any>>(
      `/meals/reservations/scan?qrCode=${encodeURIComponent(qrCode)}`
    );
    return response.data;
  },

  /**
   * QR kod ile rezervasyon kullanımı (cafeteria staff)
   * Backend'de query parameter olarak qrCode bekliyor: POST /use?qrCode=...
   */
  async useReservation(qrCode: string): Promise<ApiResponse<any>> {
    const response = await httpClient.post<ApiResponse<any>>(
      `/meals/reservations/use?qrCode=${encodeURIComponent(qrCode)}`
    );
    return response.data;
  },
};

