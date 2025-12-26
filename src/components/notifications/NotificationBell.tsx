/**
 * NotificationBell Component
 * Header'da bildirim zili ve dropdown
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificationService } from '@/services/api/notification.service';
import type { Notification } from '@/types/api.types';
import './NotificationBell.css';

// Kategori ikonları
const categoryIcons: Record<string, string> = {
    academic: '📚',
    attendance: '📋',
    meal: '🍽️',
    event: '🎉',
    payment: '💳',
    system: '⚙️',
};

// Kategori renkleri
const categoryColors: Record<string, string> = {
    academic: '#2196F3',
    attendance: '#4CAF50',
    meal: '#FF9800',
    event: '#9C27B0',
    payment: '#00BCD4',
    system: '#607D8B',
};

export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Okunmamış bildirim sayısı
    const { data: unreadData } = useQuery(
        'notification-unread-count',
        () => notificationService.getUnreadCount(),
        {
            refetchInterval: 30000, // 30 saniyede bir yenile
            retry: 1,
        }
    );

    // Son 5 bildirim
    const { data: notificationsData, isLoading } = useQuery(
        ['notifications-dropdown', isOpen],
        () => notificationService.getNotifications(0, 5),
        {
            enabled: isOpen,
            retry: 1,
        }
    );

    // Tümünü okundu işaretle mutation
    const markAllReadMutation = useMutation(
        () => notificationService.markAllAsRead(),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notification-unread-count');
                queryClient.invalidateQueries('notifications-dropdown');
            },
        }
    );

    // Tek bildirimi okundu işaretle
    const markReadMutation = useMutation(
        (id: string) => notificationService.markAsRead(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notification-unread-count');
                queryClient.invalidateQueries('notifications-dropdown');
            },
        }
    );

    // Dışarı tıklandığında dropdown'ı kapat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const unreadCount = unreadData?.data?.unreadCount || 0;
    const notifications = notificationsData?.data?.content || [];

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Şimdi';
        if (diffMins < 60) return `${diffMins} dk önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        return date.toLocaleDateString('tr-TR');
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markReadMutation.mutate(notification.id);
        }
        setIsOpen(false);
    };

    return (
        <div className="notification-bell" ref={dropdownRef}>
            <button
                className="notification-bell__button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Bildirimler"
            >
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z"
                        fill="currentColor"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-bell__badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-bell__dropdown">
                    <div className="notification-bell__header">
                        <h3>Bildirimler</h3>
                        {unreadCount > 0 && (
                            <button
                                className="notification-bell__mark-all"
                                onClick={() => markAllReadMutation.mutate()}
                                disabled={markAllReadMutation.isLoading}
                            >
                                Tümünü Okundu İşaretle
                            </button>
                        )}
                    </div>

                    <div className="notification-bell__list">
                        {isLoading ? (
                            <div className="notification-bell__loading">Yükleniyor...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-bell__empty">
                                <svg
                                    width="48"
                                    height="48"
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
                                <p>Henüz bildiriminiz yok</p>
                            </div>
                        ) : (
                            notifications.map((notification: Notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-bell__item ${!notification.isRead ? 'notification-bell__item--unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div
                                        className="notification-bell__item-icon"
                                        style={{ backgroundColor: categoryColors[notification.category] || '#607D8B' }}
                                    >
                                        {categoryIcons[notification.category] || '📌'}
                                    </div>
                                    <div className="notification-bell__item-content">
                                        <div className="notification-bell__item-title">{notification.title}</div>
                                        <div className="notification-bell__item-message">{notification.message}</div>
                                        <div className="notification-bell__item-time">
                                            {formatTimeAgo(notification.createdAt)}
                                        </div>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="notification-bell__item-dot" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="notification-bell__footer">
                        <Link
                            to="/notifications"
                            className="notification-bell__view-all"
                            onClick={() => setIsOpen(false)}
                        >
                            Tüm Bildirimleri Gör
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};
