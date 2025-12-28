import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { attendanceService } from '@/services/api/attendance.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import './SessionDetailPage.css';

const QR_REFRESH_INTERVAL = 5000; // 5 saniye

export const SessionDetailPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [nextRefreshIn, setNextRefreshIn] = useState<number>(QR_REFRESH_INTERVAL / 1000);
    const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Oturum bilgilerini getir
    const { data: sessionData, isLoading } = useQuery(
        ['session', sessionId],
        () => attendanceService.getSessionById(sessionId!),
        {
            enabled: !!sessionId,
            refetchInterval: false,
            onError: () => {
                toast.error('Yoklama oturumu bilgileri yüklenirken bir hata oluştu');
            },
        }
    );

    const session = sessionData?.data as any;

    // QR Kod yenileme mutation
    const refreshQrMutation = useMutation(
        () => attendanceService.refreshQrCode(sessionId!),
        {
            onSuccess: (data) => {
                queryClient.setQueryData(['session', sessionId], data);
                setNextRefreshIn(QR_REFRESH_INTERVAL / 1000);
            },
            onError: (error: any) => {
                console.error('QR yenileme hatası:', error);
            },
        }
    );

    // Oturumu kapatma mutation
    const closeSessionMutation = useMutation(
        () => attendanceService.closeSession(sessionId!),
        {
            onSuccess: () => {
                toast.success('Yoklama oturumu kapatıldı');
                navigate('/sections');
            },
            onError: (error: any) => {
                toast.error(error?.message || 'Oturum kapatılırken bir hata oluştu');
            },
        }
    );

    // QR otomatik yenileme (5 saniyede bir)
    useEffect(() => {
        const sessionStatus = (session?.status || '').toString().toUpperCase();
        if (sessionStatus === 'ACTIVE') {
            // QR yenileme interval
            refreshIntervalRef.current = setInterval(() => {
                refreshQrMutation.mutate();
            }, QR_REFRESH_INTERVAL);

            // Geri sayım interval
            countdownIntervalRef.current = setInterval(() => {
                setNextRefreshIn((prev) => {
                    if (prev <= 1) return QR_REFRESH_INTERVAL / 1000;
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            };
        }
    }, [session?.status, sessionId]);

    // Kalan süre hesaplama
    useEffect(() => {
        if (session?.endTime && session?.date) {
            const updateRemainingTime = () => {
                const now = new Date();

                // Backend LocalDate (YYYY-MM-DD) ve LocalTime (HH:mm:ss) formatında dönüyor
                // Bunları birleştirip Date objesi oluşturmalıyız
                let endDateTime: Date;

                // endTime sadece saat mi yoksa tam tarih mi kontrol et
                if (typeof session.endTime === 'string' && session.endTime.includes(':') && !session.endTime.includes('T')) {
                    // LocalTime formatı: "HH:mm:ss" veya "HH:mm"
                    // LocalDate formatı: "YYYY-MM-DD"
                    const dateStr = session.date || new Date().toISOString().split('T')[0];
                    const timeStr = session.endTime;
                    endDateTime = new Date(`${dateStr}T${timeStr}`);
                } else {
                    // Zaten ISO formatında veya timestamp
                    endDateTime = new Date(session.endTime);
                }

                // Geçerli bir tarih mi kontrol et
                if (isNaN(endDateTime.getTime())) {
                    setTimeRemaining('--');
                    return;
                }

                const diff = endDateTime.getTime() - now.getTime();

                if (diff <= 0) {
                    setTimeRemaining('Süre doldu');
                    return;
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                if (days > 0) {
                    setTimeRemaining(`${days}g ${hours}s ${minutes}dk`);
                } else if (hours > 0) {
                    setTimeRemaining(`${hours}s ${minutes}dk ${seconds}sn`);
                } else {
                    setTimeRemaining(`${minutes}dk ${seconds}sn`);
                }
            };

            updateRemainingTime();
            const timer = setInterval(updateRemainingTime, 1000);
            return () => clearInterval(timer);
        } else {
            setTimeRemaining('--');
        }
    }, [session?.endTime, session?.date]);

    const handleManualRefresh = () => {
        refreshQrMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="session-detail-page">
                <LoadingSpinner />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="session-detail-page">
                <div className="error-message">
                    <h3>Yoklama oturumu bulunamadı</h3>
                    <Button onClick={() => navigate('/sections')}>Geri Dön</Button>
                </div>
            </div>
        );
    }

    const sessionStatus = (session?.status || '').toString().toUpperCase();
    const isActive = sessionStatus === 'ACTIVE';
    const qrCodeUrl = (session as any).qrCodeUrl || session.qrCode;

    return (
        <div className="session-detail-page">
            <Breadcrumb
                items={[
                    { label: 'Ana Sayfa', to: '/dashboard' },
                    { label: 'Ders Bölümleri', to: '/sections' },
                    { label: 'Yoklama Oturumu' },
                ]}
            />
            <PageHeader
                title={session.courseName || 'Yoklama Oturumu'}
                description={`${session.courseCode || ''} - Bölüm ${session.sectionNumber || ''}`}
            />

            <div className="session-detail-container">
                {/* QR Code Card */}
                <Card className="qr-card">
                    <CardContent>
                        <div className="qr-section">
                            {isActive && qrCodeUrl ? (
                                <>
                                    <div className="qr-wrapper">
                                        <img
                                            src={qrCodeUrl}
                                            alt="Yoklama QR Kodu"
                                            className="qr-image"
                                        />
                                    </div>
                                    <p className="qr-hint">
                                        Öğrenciler bu QR kodu tarayarak yoklama verebilir
                                    </p>
                                    <div className="qr-refresh-info">
                                        <span className="refresh-countdown">
                                            Sonraki yenileme: {nextRefreshIn}sn
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="qr-inactive">
                                    <p>Oturum aktif değil veya QR kod oluşturulamadı</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Session Info Card */}
                <Card className="info-card">
                    <CardHeader>
                        <CardTitle>📅 TARİH VE SAAT</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="info-content">
                            <div className="info-date">
                                {(() => {
                                    // Backend LocalDate formatında dönüyor: "YYYY-MM-DD"
                                    const dateStr = session.date;
                                    if (!dateStr) return '-';
                                    try {
                                        const date = new Date(dateStr + 'T00:00:00');
                                        if (isNaN(date.getTime())) return dateStr;
                                        return date.toLocaleDateString('tr-TR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        });
                                    } catch {
                                        return dateStr;
                                    }
                                })()}
                            </div>
                            <div className="info-time">
                                {(() => {
                                    // Backend LocalTime formatında dönüyor: "HH:mm:ss" veya "HH:mm"
                                    const formatTime = (timeStr: string) => {
                                        if (!timeStr) return '-';
                                        const parts = timeStr.split(':');
                                        if (parts.length >= 2) {
                                            return `${parts[0]}:${parts[1]}`;
                                        }
                                        return timeStr;
                                    };
                                    return `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`;
                                })()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Time Remaining Card */}
                <Card className="time-card">
                    <CardHeader>
                        <CardTitle>⏱ KALAN SÜRE</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="time-remaining">{timeRemaining}</div>
                    </CardContent>
                </Card>

                {/* Location Info Card */}
                <Card className="location-card">
                    <CardHeader>
                        <CardTitle>📍 KONUM BİLGİLERİ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="location-info">
                            <div className="location-item">
                                <span className="location-label">Enlem:</span>
                                <span className="location-value">{session.latitude}</span>
                            </div>
                            <div className="location-item">
                                <span className="location-label">Boylam:</span>
                                <span className="location-value">{session.longitude}</span>
                            </div>
                            <div className="location-item">
                                <span className="location-label">Geofence:</span>
                                <span className="location-value">{session.geofenceRadius || 15}m</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Session ID Card */}
                <Card className="id-card">
                    <CardHeader>
                        <CardTitle>🆔 OTURUM ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="session-id">#{session.id}</div>
                    </CardContent>
                </Card>

                {/* Status Badge */}
                <div className={`status-badge status-${isActive ? 'active' : 'closed'}`}>
                    {isActive ? '✅ Aktif' : '❌ Kapalı'}
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    {isActive && (
                        <Button
                            variant="danger"
                            onClick={() => closeSessionMutation.mutate()}
                            disabled={closeSessionMutation.isLoading}
                        >
                            {closeSessionMutation.isLoading ? 'Kapatılıyor...' : '🔒 Oturumu Kapat'}
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        onClick={handleManualRefresh}
                        disabled={!isActive || refreshQrMutation.isLoading}
                    >
                        {refreshQrMutation.isLoading ? 'Yenileniyor...' : '🔄 Yenile'}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                    >
                        ← Geri Dön
                    </Button>
                </div>
            </div>
        </div>
    );
};
