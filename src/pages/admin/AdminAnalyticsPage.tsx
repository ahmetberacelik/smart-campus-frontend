/**
 * Admin Analytics Dashboard Page
 * Yönetici istatistik sayfası
 */

import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { analyticsService } from '@/services/api/analytics.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from 'recharts';
import './AdminAnalyticsPage.css';

// Chart renkleri
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AdminAnalyticsPage: React.FC = () => {
    const [isExporting, setIsExporting] = useState<string | null>(null);

    // Dashboard stats
    const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
        'analytics-dashboard',
        () => analyticsService.getDashboardStats(),
        { retry: 1 }
    );

    // Academic stats
    const { data: academicData, isLoading: academicLoading } = useQuery(
        'analytics-academic',
        () => analyticsService.getAcademicStats(),
        { retry: 1 }
    );

    // Attendance stats
    const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
        'analytics-attendance',
        () => analyticsService.getAttendanceStats(),
        { retry: 1 }
    );

    // Meal stats
    const { data: mealData, isLoading: mealLoading } = useQuery(
        'analytics-meals',
        () => analyticsService.getMealStats(),
        { retry: 1 }
    );

    // Event stats
    const { data: eventData, isLoading: eventLoading } = useQuery(
        'analytics-events',
        () => analyticsService.getEventStats(),
        { retry: 1 }
    );

    const handleExport = async (type: 'excel' | 'pdf' | 'csv') => {
        try {
            setIsExporting(type);
            const blob = await analyticsService.exportReport(type);
            const extension = type === 'excel' ? 'xlsx' : type;
            analyticsService.downloadReport(blob, `analytics-report.${extension}`);
            toast.success(`${type.toUpperCase()} raporu indirildi`);
        } catch (error) {
            toast.error('Rapor indirilirken bir hata oluştu');
        } finally {
            setIsExporting(null);
        }
    };

    const dashboard = dashboardData?.data;
    const academicRaw = academicData?.data;
    const attendanceRaw = attendanceData?.data;
    const mealsRaw = mealData?.data;
    const eventsRaw = eventData?.data;

    // Backend verilerini frontend'in beklediği formata dönüştür

    // GPA Distribution: Map -> Array
    const gpaDistribution = academicRaw?.gradeDistribution
        ? Object.entries(academicRaw.gradeDistribution as Record<string, number>).map(([range, count]) => ({
            range,
            count: typeof count === 'number' ? count : 0
        }))
        : [];

    // Attendance by day from weeklyTrend or courseStats (fallback if weeklyTrend is empty)
    const attendanceByDay = (attendanceRaw?.weeklyTrend && attendanceRaw.weeklyTrend.length > 0)
        ? attendanceRaw.weeklyTrend.map((trend: any) => ({
            day: trend.date || 'N/A',
            rate: trend.attendanceRate || 0
        }))
        : (attendanceRaw?.courseStats && attendanceRaw.courseStats.length > 0)
            ? attendanceRaw.courseStats.map((cs: any) => ({
                day: cs.courseCode || cs.courseName || 'N/A',
                rate: cs.attendanceRate || 0
            }))
            : [];

    // Meal reservations by type: Map -> Array
    const reservationsByMealType = mealsRaw?.mealTypeDistribution
        ? Object.entries(mealsRaw.mealTypeDistribution as Record<string, number>).map(([type, count]) => ({
            type,
            count: typeof count === 'number' ? count : 0
        }))
        : [];

    // Events by category: Map -> Array
    const eventsByCategory = eventsRaw?.categoryDistribution
        ? Object.entries(eventsRaw.categoryDistribution as Record<string, number>).map(([category, count]) => ({
            category,
            count: typeof count === 'number' ? count : 0
        }))
        : [];

    // Transformed data objects
    const academic = {
        ...academicRaw,
        gpaDistribution
    };

    const attendance = {
        ...attendanceRaw,
        overallRate: attendanceRaw?.overallAttendanceRate || 0,
        attendanceByDay,
        lowAttendanceStudents: attendanceRaw?.studentsWithWarning || 0
    };

    const meals = {
        ...mealsRaw,
        reservationsByMealType,
        totalReservations: mealsRaw?.totalReservationsThisMonth || 0
    };

    const events = {
        ...eventsRaw,
        eventsByCategory
    };

    const isLoading = dashboardLoading || academicLoading || attendanceLoading || mealLoading || eventLoading;

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="admin-analytics-page">
            <Breadcrumb
                items={[
                    { label: 'Ana Sayfa', to: '/dashboard' },
                    { label: 'Analytics Dashboard' },
                ]}
            />
            <PageHeader
                title="Analytics Dashboard"
                description="Sistem istatistikleri ve raporları"
            />

            {/* Export Buttons */}
            <div className="analytics-export-buttons">
                <Button
                    variant="outline"
                    onClick={() => handleExport('excel')}
                    isLoading={isExporting === 'excel'}
                >
                    📊 Excel İndir
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleExport('pdf')}
                    isLoading={isExporting === 'pdf'}
                >
                    📄 PDF İndir
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleExport('csv')}
                    isLoading={isExporting === 'csv'}
                >
                    📑 CSV İndir
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="analytics-summary-cards">
                <Card variant="elevated" className="analytics-stat-card">
                    <CardContent>
                        <div className="analytics-stat-icon analytics-stat-icon-blue">👨‍🎓</div>
                        <div className="analytics-stat-value">{dashboard?.totalStudents || 0}</div>
                        <div className="analytics-stat-label">Toplam Öğrenci</div>
                    </CardContent>
                </Card>
                <Card variant="elevated" className="analytics-stat-card">
                    <CardContent>
                        <div className="analytics-stat-icon analytics-stat-icon-green">👨‍🏫</div>
                        <div className="analytics-stat-value">{dashboard?.totalFaculty || 0}</div>
                        <div className="analytics-stat-label">Toplam Öğretim Üyesi</div>
                    </CardContent>
                </Card>
                <Card variant="elevated" className="analytics-stat-card">
                    <CardContent>
                        <div className="analytics-stat-icon analytics-stat-icon-purple">📚</div>
                        <div className="analytics-stat-value">{dashboard?.totalCourses || 0}</div>
                        <div className="analytics-stat-label">Toplam Ders</div>
                    </CardContent>
                </Card>
                <Card variant="elevated" className="analytics-stat-card">
                    <CardContent>
                        <div className="analytics-stat-icon analytics-stat-icon-orange">📋</div>
                        <div className="analytics-stat-value">{dashboard?.totalEnrollments || 0}</div>
                        <div className="analytics-stat-label">Toplam Kayıt</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="analytics-charts-grid">
                {/* GPA Distribution */}
                <Card variant="default">
                    <CardHeader>
                        <CardTitle>📊 GPA Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {academic?.gpaDistribution && academic.gpaDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={academic.gpaDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="analytics-no-data">Veri bulunamadı</div>
                        )}
                    </CardContent>
                </Card>

                {/* Attendance Trend */}
                <Card variant="default">
                    <CardHeader>
                        <CardTitle>📈 Haftalık Yoklama Trendi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {attendance?.attendanceByDay && attendance.attendanceByDay.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={attendance.attendanceByDay}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip formatter={(value: number) => `${value}%`} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="rate"
                                        name="Katılım Oranı"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="analytics-no-data">Veri bulunamadı</div>
                        )}
                    </CardContent>
                </Card>

                {/* Meal Reservations */}
                <Card variant="default">
                    <CardHeader>
                        <CardTitle>🍽️ Yemek Rezervasyonları</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {meals?.reservationsByMealType && meals.reservationsByMealType.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={meals.reservationsByMealType}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="type"
                                    >
                                        {meals.reservationsByMealType.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="analytics-no-data">Veri bulunamadı</div>
                        )}
                    </CardContent>
                </Card>

                {/* Events by Category */}
                <Card variant="default">
                    <CardHeader>
                        <CardTitle>🎉 Etkinlik Kategorileri</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {events?.eventsByCategory && events.eventsByCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={events.eventsByCategory} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="category" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="analytics-no-data">Veri bulunamadı</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            <div className="analytics-additional-stats">
                <Card variant="default">
                    <CardHeader>
                        <CardTitle>📋 Özet İstatistikler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="analytics-stats-list">
                            <div className="analytics-stats-item">
                                <span className="analytics-stats-item-label">Ortalama GPA</span>
                                <span className="analytics-stats-item-value">{academic?.averageGpa?.toFixed(2) || '-'}</span>
                            </div>
                            <div className="analytics-stats-item">
                                <span className="analytics-stats-item-label">Genel Yoklama Oranı</span>
                                <span className="analytics-stats-item-value">{attendance?.overallRate?.toFixed(1) || '-'}%</span>
                            </div>
                            <div className="analytics-stats-item">
                                <span className="analytics-stats-item-label">Bugünkü Yemek Rezervasyonu</span>
                                <span className="analytics-stats-item-value">{dashboard?.totalMealReservationsToday || 0}</span>
                            </div>
                            <div className="analytics-stats-item">
                                <span className="analytics-stats-item-label">Yaklaşan Etkinlikler</span>
                                <span className="analytics-stats-item-value">{events?.upcomingEvents || 0}</span>
                            </div>
                            <div className="analytics-stats-item">
                                <span className="analytics-stats-item-label">Burslu Yemek</span>
                                <span className="analytics-stats-item-value">{meals?.scholarshipMeals || 0}</span>
                            </div>
                            <div className="analytics-stats-item">
                                <span className="analytics-stats-item-label">Düşük Yoklama Öğrenci</span>
                                <span className="analytics-stats-item-value">{attendance?.lowAttendanceStudents || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
