/**
 * Notifications Page
 * Tüm bildirimlerin listelendiği sayfa
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificationService } from '@/services/api/notification.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Notification } from '@/types/api.types';
import './NotificationsPage.css';

// Kategori ikonları ve isimleri
const categoryConfig: Record<string, { icon: string; label: string; color: string }> = {
    academic: { icon: '📚', label: 'Akademik', color: '#2196F3' },
    attendance: { icon: '📋', label: 'Yoklama', color: '#4CAF50' },
    meal: { icon: '🍽️', label: 'Yemek', color: '#FF9800' },
    event: { icon: '🎉', label: 'Etkinlik', color: '#9C27B0' },
    payment: { icon: '💳', label: 'Ödeme', color: '#00BCD4' },
    system: { icon: '⚙️', label: 'Sistem', color: '#607D8B' },
};

export const NotificationsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [readFilter, setReadFilter] = useState<string>('');

    // Bildirimler
    const { data: notificationsData, isLoading, error } = useQuery(
        ['notifications', page],
        () => notificationService.getNotifications(page, 20),
        { retry: 1 }
    );

    // Tümünü okundu işaretle
    const markAllReadMutation = useMutation(
        () => notificationService.markAllAsRead(),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notifications');
                queryClient.invalidateQueries('notification-unread-count');
            },
        }
    );

    // Tek bildirimi okundu işaretle
    const markReadMutation = useMutation(
        (id: string) => notificationService.markAsRead(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notifications');
                queryClient.invalidateQueries('notification-unread-count');
            },
        }
    );

    // Bildirimi sil
    const deleteMutation = useMutation(
        (id: string) => notificationService.deleteNotification(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notifications');
                queryClient.invalidateQueries('notification-unread-count');
            },
        }
    );

    const notifications = notificationsData?.data?.content || [];
    const totalPages = notificationsData?.data?.totalPages || 0;
    const totalElements = notificationsData?.data?.totalElements || 0;

    // Filtreleme (client-side)
    const filteredNotifications = notifications.filter((n: Notification) => {
        if (categoryFilter && n.category !== categoryFilter) return false;
        if (readFilter === 'unread' && n.isRead) return false;
        if (readFilter === 'read' && !n.isRead) return false;
        return true;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const categoryOptions = [
        { value: '', label: 'Tüm Kategoriler' },
        { value: 'academic', label: '📚 Akademik' },
        { value: 'attendance', label: '📋 Yoklama' },
        { value: 'meal', label: '🍽️ Yemek' },
        { value: 'event', label: '🎉 Etkinlik' },
        { value: 'payment', label: '💳 Ödeme' },
        { value: 'system', label: '⚙️ Sistem' },
    ];

    const readOptions = [
        { value: '', label: 'Tümü' },
        { value: 'unread', label: 'Okunmamışlar' },
        { value: 'read', label: 'Okunmuşlar' },
    ];

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error) {
        return (
            <div className="notifications-page">
                <Breadcrumb
                    items={[
                        { label: 'Ana Sayfa', to: '/dashboard' },
                        { label: 'Bildirimler' },
                    ]}
                />
                <PageHeader title="Bildirimler" description="Tüm bildirimlerinizi görüntüleyin" />
                <Card>
                    <CardContent>
                        <div className="notifications-error">
                            <p>Bildirimler yüklenirken bir hata oluştu.</p>
                            <Button onClick={() => queryClient.invalidateQueries('notifications')}>
                                Tekrar Dene
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <Breadcrumb
                items={[
                    { label: 'Ana Sayfa', to: '/dashboard' },
                    { label: 'Bildirimler' },
                ]}
            />
            <PageHeader
                title="Bildirimler"
                description={`Toplam ${totalElements} bildirim`}
            />

            {/* Filters & Actions */}
            <div className="notifications-toolbar">
                <div className="notifications-filters">
                    <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        options={categoryOptions}
                        style={{ minWidth: '180px' }}
                    />
                    <Select
                        value={readFilter}
                        onChange={(e) => setReadFilter(e.target.value)}
                        options={readOptions}
                        style={{ minWidth: '150px' }}
                    />
                </div>
                <div className="notifications-actions">
                    <Button
                        variant="secondary"
                        onClick={() => markAllReadMutation.mutate()}
                        disabled={markAllReadMutation.isLoading}
                    >
                        Tümünü Okundu İşaretle
                    </Button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <Card>
                        <CardContent>
                            <div className="notifications-empty">
                                <svg
                                    width="64"
                                    height="64"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
                                        fill="currentColor"
                                        opacity="0.3"
                                    />
                                </svg>
                                <h3>Bildirim bulunamadı</h3>
                                <p>Seçili filtrelere uygun bildirim bulunmuyor.</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredNotifications.map((notification: Notification) => {
                        const config = categoryConfig[notification.category] || categoryConfig.system;
                        return (
                            <Card
                                key={notification.id}
                                className={`notification-card ${!notification.isRead ? 'notification-card--unread' : ''}`}
                            >
                                <CardContent>
                                    <div className="notification-item">
                                        <div
                                            className="notification-item__icon"
                                            style={{ backgroundColor: config.color }}
                                        >
                                            {config.icon}
                                        </div>
                                        <div className="notification-item__content">
                                            <div className="notification-item__header">
                                                <span className="notification-item__category">{config.label}</span>
                                                <span className="notification-item__date">
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                            </div>
                                            <h4 className="notification-item__title">{notification.title}</h4>
                                            <p className="notification-item__message">{notification.message}</p>
                                        </div>
                                        <div className="notification-item__actions">
                                            {!notification.isRead && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => markReadMutation.mutate(notification.id)}
                                                    disabled={markReadMutation.isLoading}
                                                >
                                                    Okundu
                                                </Button>
                                            )}
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Bu bildirimi silmek istediğinize emin misiniz?')) {
                                                        deleteMutation.mutate(notification.id);
                                                    }
                                                }}
                                                disabled={deleteMutation.isLoading}
                                            >
                                                Sil
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="notifications-pagination">
                    <Button
                        variant="secondary"
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                    >
                        Önceki
                    </Button>
                    <span className="notifications-pagination__info">
                        Sayfa {page + 1} / {totalPages}
                    </span>
                    <Button
                        variant="secondary"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(page + 1)}
                    >
                        Sonraki
                    </Button>
                </div>
            )}
        </div>
    );
};
