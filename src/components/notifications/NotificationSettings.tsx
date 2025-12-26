/**
 * NotificationSettings Component
 * Bildirim tercihleri ayarları (ProfilePage tab için)
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificationService, type UpdatePreferencesRequest, type NotificationPreferenceResponse } from '@/services/api/notification.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import './NotificationSettings.css';

interface PreferenceRow {
    key: keyof NotificationPreferenceResponse;
    label: string;
    category: string;
}

const emailPreferences: PreferenceRow[] = [
    { key: 'emailAcademic', label: 'Akademik bildirimler', category: 'academic' },
    { key: 'emailAttendance', label: 'Yoklama bildirimleri', category: 'attendance' },
    { key: 'emailMeal', label: 'Yemek bildirimleri', category: 'meal' },
    { key: 'emailEvent', label: 'Etkinlik bildirimleri', category: 'event' },
    { key: 'emailPayment', label: 'Ödeme bildirimleri', category: 'payment' },
    { key: 'emailSystem', label: 'Sistem bildirimleri', category: 'system' },
];

const pushPreferences: PreferenceRow[] = [
    { key: 'pushAcademic', label: 'Akademik bildirimler', category: 'academic' },
    { key: 'pushAttendance', label: 'Yoklama bildirimleri', category: 'attendance' },
    { key: 'pushMeal', label: 'Yemek bildirimleri', category: 'meal' },
    { key: 'pushEvent', label: 'Etkinlik bildirimleri', category: 'event' },
    { key: 'pushPayment', label: 'Ödeme bildirimleri', category: 'payment' },
    { key: 'pushSystem', label: 'Sistem bildirimleri', category: 'system' },
];

const categoryIcons: Record<string, string> = {
    academic: '📚',
    attendance: '📋',
    meal: '🍽️',
    event: '🎉',
    payment: '💳',
    system: '⚙️',
};

export const NotificationSettings: React.FC = () => {
    const queryClient = useQueryClient();
    const [localPrefs, setLocalPrefs] = useState<Partial<NotificationPreferenceResponse>>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Tercihleri getir
    const { isLoading, error } = useQuery(
        'notification-preferences',
        () => notificationService.getPreferences(),
        {
            retry: 1,
            onSuccess: (data) => {
                if (data.data) {
                    setLocalPrefs(data.data);
                }
            },
        }
    );

    // Tercihleri güncelle
    const updateMutation = useMutation(
        (data: UpdatePreferencesRequest) => notificationService.updatePreferences(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notification-preferences');
                toast.success('Bildirim tercihleri güncellendi');
                setHasChanges(false);
            },
            onError: () => {
                toast.error('Tercihler güncellenirken bir hata oluştu');
            },
        }
    );

    const handleToggle = (key: keyof NotificationPreferenceResponse) => {
        setLocalPrefs((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        updateMutation.mutate(localPrefs as UpdatePreferencesRequest);
    };

    if (isLoading) {
        return (
            <div className="notification-settings__loading">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent>
                    <div className="notification-settings__error">
                        <p>Tercihler yüklenirken bir hata oluştu.</p>
                        <Button onClick={() => queryClient.invalidateQueries('notification-preferences')}>
                            Tekrar Dene
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="notification-settings">
            {/* Email Bildirimleri */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                            <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor" />
                        </svg>
                        E-posta Bildirimleri
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="notification-settings__description">
                        E-posta ile almak istediğiniz bildirim kategorilerini seçin.
                    </p>
                    <div className="notification-settings__list">
                        {emailPreferences.map((pref) => (
                            <div key={pref.key} className="notification-settings__item">
                                <div className="notification-settings__item-info">
                                    <span className="notification-settings__item-icon">
                                        {categoryIcons[pref.category]}
                                    </span>
                                    <span className="notification-settings__item-label">{pref.label}</span>
                                </div>
                                <label className="notification-settings__toggle">
                                    <input
                                        type="checkbox"
                                        checked={!!localPrefs[pref.key]}
                                        onChange={() => handleToggle(pref.key)}
                                    />
                                    <span className="notification-settings__toggle-slider" />
                                </label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Push Bildirimleri */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor" />
                        </svg>
                        Anlık Bildirimler
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="notification-settings__description">
                        Tarayıcı üzerinden anlık bildirim almak istediğiniz kategorileri seçin.
                    </p>
                    <div className="notification-settings__list">
                        {pushPreferences.map((pref) => (
                            <div key={pref.key} className="notification-settings__item">
                                <div className="notification-settings__item-info">
                                    <span className="notification-settings__item-icon">
                                        {categoryIcons[pref.category]}
                                    </span>
                                    <span className="notification-settings__item-label">{pref.label}</span>
                                </div>
                                <label className="notification-settings__toggle">
                                    <input
                                        type="checkbox"
                                        checked={!!localPrefs[pref.key]}
                                        onChange={() => handleToggle(pref.key)}
                                    />
                                    <span className="notification-settings__toggle-slider" />
                                </label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Kaydet Butonu */}
            {hasChanges && (
                <div className="notification-settings__actions">
                    <Button
                        onClick={handleSave}
                        isLoading={updateMutation.isLoading}
                    >
                        Değişiklikleri Kaydet
                    </Button>
                </div>
            )}
        </div>
    );
};
