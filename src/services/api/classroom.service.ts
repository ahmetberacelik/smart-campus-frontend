/**
 * Classroom Service
 * Derslik yönetimi API entegrasyonu
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse } from '@/types/api.types';

export interface Classroom {
    id: number;
    building: string;
    roomNumber: string;
    capacity: number;
    hasProjector: boolean;
    hasWhiteboard: boolean;
    isActive: boolean;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const classroomService = {
    /**
     * Tüm derslikleri listele (sayfalama ile - PageResponse döner)
     */
    async getClassrooms(): Promise<ApiResponse<PageResponse<Classroom>>> {
        const response = await httpClient.get<ApiResponse<PageResponse<Classroom>>>(
            API_ENDPOINTS.CLASSROOMS.LIST,
            { params: { size: 100 } } // Tüm derslikleri almak için büyük sayfa boyutu
        );
        return response.data;
    },

    /**
     * Minimum kapasite ile derslikleri listele (Array döner)
     */
    async getClassroomsByCapacity(minCapacity: number = 1): Promise<ApiResponse<Classroom[]>> {
        const response = await httpClient.get<ApiResponse<Classroom[]>>(
            API_ENDPOINTS.CLASSROOMS.BY_CAPACITY(minCapacity)
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
};
