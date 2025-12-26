import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { eventService } from '@/services/api/event.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
// Badge removed - not used
import { QrCodeScanner } from '@/components/qr/QrCodeScanner';
import { useAuth } from '@/context/AuthContext';
import './EventCheckInPage.css';

export const EventCheckInPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [scannedData, setScannedData] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [eventInfo, setEventInfo] = useState<any>(null);

  // QR kod doğrulama (sorgulama)
  const validateQrMutation = useMutation(
    (qrCode: string) => eventService.getRegistrationByQrCode(qrCode),
    {
      onSuccess: (response) => {
        setScannedData(response.data);
        setUserInfo(response.data?.user || response.data);
        setEventInfo(response.data?.event || response.data);
        toast.success('QR kod doğrulandı');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'QR kod doğrulanamadı');
        setScannedData(null);
        setUserInfo(null);
        setEventInfo(null);
      },
    }
  );

  // Check-in onaylama
  const checkInMutation = useMutation(
    (qrCode: string) => eventService.checkIn(qrCode),
    {
      onSuccess: () => {
        toast.success('Check-in başarıyla yapıldı');
        setScannedData(null);
        setUserInfo(null);
        setEventInfo(null);
        queryClient.invalidateQueries('event-checkin');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Check-in yapılırken bir hata oluştu');
      },
    }
  );

  const handleScan = (qrCode: string) => {
    // Backend'e QR kod'u gönder ve doğrulat
    validateQrMutation.mutate(qrCode);
  };

  const handleConfirmCheckIn = () => {
    // QR kod'dan qrCode'u al (scannedData'dan veya direkt QR string'den)
    const qrCode = scannedData?.qrCode || scannedData?.id || '';
    if (qrCode) {
      checkInMutation.mutate(qrCode);
    }
  };

  const isEventManager = user?.role?.toLowerCase() === 'faculty' || user?.role === 'FACULTY' || user?.role === 'ADMIN';

  if (!isEventManager) {
    return (
      <div className="event-checkin-page">
        <div className="error-message">
          <h3>Yetki Gerekli</h3>
          <p>Bu sayfaya erişim için yetkiniz yok</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-checkin-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Etkinlik Check-in' },
        ]}
      />
      <PageHeader
        title="Etkinlik Check-in"
        description="Etkinlik QR kodlarını tarayın ve katılımcıları check-in yapın"
      />

      <div className="checkin-container">
        <Card>
          <CardHeader>
            <CardTitle>QR Kod Tarama</CardTitle>
          </CardHeader>
          <CardContent>
            <QrCodeScanner
              onScan={handleScan}
              onError={(error) => toast.error(error)}
              title="Etkinlik QR Kodunu Tarayın"
              showManualInput={true}
            />
          </CardContent>
        </Card>

        {/* Scanned Data Display */}
        {validateQrMutation.isLoading && (
          <Card>
            <CardContent>
              <div className="loading-state">
                <LoadingSpinner />
                <p>QR kod doğrulanıyor...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {scannedData && userInfo && (
          <Card className="scanned-data-card">
            <CardHeader>
              <CardTitle>Katılımcı Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              {eventInfo && (
                <div className="info-section">
                  <h4>Etkinlik: {eventInfo.title || '-'}</h4>
                </div>
              )}

              <div className="info-section">
                <h4>Katılımcı Bilgileri</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Ad Soyad:</span>
                    <span className="info-value">
                      {userInfo.name || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim()}
                    </span>
                  </div>
                  {userInfo.studentNumber && (
                    <div className="info-item">
                      <span className="info-label">Öğrenci No:</span>
                      <span className="info-value">{userInfo.studentNumber}</span>
                    </div>
                  )}
                  {userInfo.email && (
                    <div className="info-item">
                      <span className="info-label">E-posta:</span>
                      <span className="info-value">{userInfo.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="checkin-section">
                <button
                  className="checkin-button"
                  onClick={handleConfirmCheckIn}
                  disabled={checkInMutation.isLoading}
                >
                  {checkInMutation.isLoading ? 'Check-in yapılıyor...' : '✅ Check-in Yap'}
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

