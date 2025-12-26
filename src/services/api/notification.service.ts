/**
 * Notification Service
 * Bildirim API işlemleri
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse, Notification } from '@/types/api.types';

export interface NotificationListResponse {
    content: Notification[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface NotificationPreferenceResponse {
    emailAcademic: boolean;
    emailAttendance: boolean;
    emailMeal: boolean;
    emailEvent: boolean;
    emailPayment: boolean;
    emailSystem: boolean;
    pushAcademic: boolean;
    pushAttendance: boolean;
    pushMeal: boolean;
    pushEvent: boolean;
    pushPayment: boolean;
    pushSystem: boolean;
    smsAttendance: boolean;
    smsPayment: boolean;
}

export interface UpdatePreferencesRequest {
    emailAcademic?: boolean;
    emailAttendance?: boolean;
    emailMeal?: boolean;
    emailEvent?: boolean;
    emailPayment?: boolean;
    emailSystem?: boolean;
    pushAcademic?: boolean;
    pushAttendance?: boolean;
    pushMeal?: boolean;
    pushEvent?: boolean;
    pushPayment?: boolean;
    pushSystem?: boolean;
    smsAttendance?: boolean;
    smsPayment?: boolean;
}

export const notificationService = {
    /**
     * Bildirimleri listele (sayfalı)
     */
    async getNotifications(page: number = 0, size: number = 20): Promise<ApiResponse<NotificationListResponse>> {
        const response = await httpClient.get<ApiResponse<NotificationListResponse>>(
            `${API_ENDPOINTS.NOTIFICATIONS.LIST}?page=${page}&size=${size}`
        );
        return response.data;
    },

    /**
     * Okunmamış bildirim sayısını getir
     */
    async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
        const response = await httpClient.get<ApiResponse<{ unreadCount: number }>>(
            `${API_ENDPOINTS.NOTIFICATIONS.LIST}/unread-count`
        );
        return response.data;
    },

    /**
     * Bildirimi okundu olarak işaretle
     */
    async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
        const response = await httpClient.put<ApiResponse<Notification>>(
            API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId)
        );
        return response.data;
    },

    /**
     * Tüm bildirimleri okundu olarak işaretle
     */
    async markAllAsRead(): Promise<ApiResponse<{ markedCount: number }>> {
        const response = await httpClient.put<ApiResponse<{ markedCount: number }>>(
            API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
        );
        return response.data;
    },

    /**
     * Bildirimi sil
     */
    async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
        const response = await httpClient.delete<ApiResponse<void>>(
            API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId)
        );
        return response.data;
    },

    /**
     * Bildirim tercihlerini getir
     */
    async getPreferences(): Promise<ApiResponse<NotificationPreferenceResponse>> {
        const response = await httpClient.get<ApiResponse<NotificationPreferenceResponse>>(
            API_ENDPOINTS.NOTIFICATIONS.PREFERENCES
        );
        return response.data;
    },

    /**
     * Bildirim tercihlerini güncelle
     */
    async updatePreferences(data: UpdatePreferencesRequest): Promise<ApiResponse<NotificationPreferenceResponse>> {
        const response = await httpClient.put<ApiResponse<NotificationPreferenceResponse>>(
            API_ENDPOINTS.NOTIFICATIONS.UPDATE_PREFERENCES,
            data
        );
        return response.data;
    },
};
