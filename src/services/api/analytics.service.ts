/**
 * Analytics Service
 * Admin analytics API işlemleri
 */

import httpClient from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse } from '@/types/api.types';

// Dashboard Stats Response
export interface DashboardStatsResponse {
    totalUsers?: number;
    totalStudents: number;
    totalFaculty: number;
    totalAdmins?: number;
    totalDepartments?: number;
    totalCourses: number;
    totalSections: number;
    totalEnrollments: number;
    totalAttendanceSessions?: number;
    averageAttendanceRate?: number;
    totalMealReservationsToday?: number;
    totalMealReservationsThisMonth?: number;
    totalEvents?: number;
    upcomingEvents?: number;
    totalEventRegistrations?: number;
    systemHealth?: string;
    lastUpdated?: string;
}

// Academic Stats Response - Backend returns Map for gradeDistribution
export interface AcademicStatsResponse {
    averageGpa: number;
    averageCgpa?: number;
    highestGpa?: number;
    lowestGpa?: number;
    gradeDistribution?: Record<string, number>;  // Backend: Map<String, Double>
    departmentStats?: Array<{
        departmentId: number;
        departmentName: string;
        departmentCode: string;
        averageGpa: number;
        studentCount: number;
    }>;
    passRate?: number;
    failRate?: number;
    studentsAbove3?: number;
    studentsBetween2And3?: number;
    studentsBelow2?: number;
}

// Attendance Stats Response
export interface AttendanceStatsResponse {
    overallAttendanceRate?: number;
    totalSessions?: number;
    totalRecords?: number;
    studentsWithWarning?: number;
    studentsWithCritical?: number;
    courseStats?: Array<{
        courseId: number;
        courseCode: string;
        courseName: string;
        attendanceRate: number;
        sessionCount: number;
        enrolledStudents: number;
    }>;
    weeklyTrend?: Array<{ day: string; rate: number }>;
}

// Meal Stats Response - Backend returns Map for mealTypeDistribution
export interface MealStatsResponse {
    totalReservationsToday?: number;
    totalReservationsThisWeek?: number;
    totalReservationsThisMonth?: number;
    usedReservationsToday?: number;
    cancelledReservationsToday?: number;
    scholarshipMeals?: number;
    paidMeals?: number;
    mealTypeDistribution?: Record<string, number>;  // Backend: Map<String, Long>
    cafeteriaStats?: any[];
    weeklyTrend?: any[];
}

// Event Stats Response - Backend returns Map for categoryDistribution
export interface EventStatsResponse {
    totalEvents: number;
    upcomingEvents: number;
    pastEvents?: number;
    cancelledEvents?: number;
    totalRegistrations?: number;
    checkedInCount?: number;
    averageCheckInRate?: number;
    categoryDistribution?: Record<string, number>;  // Backend: Map<String, Long>
    popularEvents?: any[];
    monthlyTrend?: any[];
}

export const analyticsService = {
    /**
     * Dashboard istatistikleri
     */
    async getDashboardStats(): Promise<ApiResponse<DashboardStatsResponse>> {
        const response = await httpClient.get<ApiResponse<DashboardStatsResponse>>(
            API_ENDPOINTS.ANALYTICS.DASHBOARD
        );
        return response.data;
    },

    /**
     * Akademik performans istatistikleri
     */
    async getAcademicStats(): Promise<ApiResponse<AcademicStatsResponse>> {
        const response = await httpClient.get<ApiResponse<AcademicStatsResponse>>(
            API_ENDPOINTS.ANALYTICS.ACADEMIC_PERFORMANCE
        );
        return response.data;
    },

    /**
     * Yoklama istatistikleri
     */
    async getAttendanceStats(): Promise<ApiResponse<AttendanceStatsResponse>> {
        const response = await httpClient.get<ApiResponse<AttendanceStatsResponse>>(
            API_ENDPOINTS.ANALYTICS.ATTENDANCE
        );
        return response.data;
    },

    /**
     * Yemek servisi istatistikleri
     */
    async getMealStats(): Promise<ApiResponse<MealStatsResponse>> {
        const response = await httpClient.get<ApiResponse<MealStatsResponse>>(
            API_ENDPOINTS.ANALYTICS.MEAL_USAGE
        );
        return response.data;
    },

    /**
     * Etkinlik istatistikleri
     */
    async getEventStats(): Promise<ApiResponse<EventStatsResponse>> {
        const response = await httpClient.get<ApiResponse<EventStatsResponse>>(
            API_ENDPOINTS.ANALYTICS.EVENTS
        );
        return response.data;
    },

    /**
     * Rapor export et (Excel, PDF, CSV)
     */
    async exportReport(type: 'excel' | 'pdf' | 'csv'): Promise<Blob> {
        const response = await httpClient.get(
            API_ENDPOINTS.ANALYTICS.EXPORT(type),
            { responseType: 'blob' }
        );
        return response.data;
    },

    /**
     * Rapor indir helper
     */
    downloadReport(blob: Blob, filename: string) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
};
