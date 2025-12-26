import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { mealService } from '@/services/api/meal.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { QrCodeScanner } from '@/components/qr/QrCodeScanner';
import { useAuth } from '@/context/AuthContext';
import './QrScannerPage.css';

export const QrScannerPage: React.FC = () => {
  const { user } = useAuth();
  const [scannedData, setScannedData] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  // QR kod doğrulama (sorgulama)
  const validateQrMutation = useMutation(
    (qrCode: string) => mealService.scanReservation(qrCode),
    {
      onSuccess: (response) => {
        setScannedData(response.data);
        setUserInfo(response.data?.user || response.data);
        toast.success('QR kod doğrulandı');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'QR kod doğrulanamadı');
        setScannedData(null);
        setUserInfo(null);
      },
    }
  );

  // Rezervasyon kullanımı onaylama
  const confirmUseMutation = useMutation(
    (qrCode: string) => mealService.useReservation(qrCode),
    {
      onSuccess: () => {
        toast.success('Rezervasyon kullanıldı');
        setScannedData(null);
        setUserInfo(null);
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Rezervasyon kullanılırken bir hata oluştu');
      },
    }
  );

  const handleScan = (qrCode: string) => {
    validateQrMutation.mutate(qrCode);
  };

  const handleConfirmUse = () => {
    if (scannedData?.qrCode || scannedData?.id) {
      const qrCode = scannedData.qrCode || scannedData.id;
      confirmUseMutation.mutate(qrCode);
    }
  };

  // Check if user has cafeteria access (FACULTY or ADMIN can also use this)
  const hasAccess = user?.role === 'FACULTY' || user?.role === 'ADMIN';

  if (!hasAccess) {
    return (
      <div className="qr-scanner-page">
        <div className="error-message">
          <h3>Yetki Gerekli</h3>
          <p>Bu sayfaya erişim için yetkiniz yok</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-scanner-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'QR Kod Tara' },
        ]}
      />
      <PageHeader
        title="QR Kod Tarayıcı"
        description="Yemek rezervasyonu QR kodlarını tarayın ve doğrulayın"
      />

      <div className="scanner-container">
        <Card>
          <CardHeader>
            <CardTitle>QR Kod Tarama</CardTitle>
          </CardHeader>
          <CardContent>
            <QrCodeScanner
              onScan={handleScan}
              onError={(error) => toast.error(error)}
              title="Rezervasyon QR Kodunu Tarayın"
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
              <CardTitle>Rezervasyon Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="user-info">
                <div className="info-section">
                  <h4>Kullanıcı Bilgileri</h4>
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
                  </div>
                </div>

                <div className="info-section">
                  <h4>Rezervasyon Detayları</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Tarih:</span>
                      <span className="info-value">
                        {scannedData.date ? new Date(scannedData.date).toLocaleDateString('tr-TR') : '-'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Öğün:</span>
                      <span className="info-value">
                        {scannedData.mealType === 'LUNCH' ? 'Öğle Yemeği' : 'Akşam Yemeği'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Durum:</span>
                      <span className="info-value">
                        <Badge variant={scannedData.status === 'RESERVED' ? 'success' : 'default'}>
                          {scannedData.status === 'RESERVED' ? 'Rezerve' : scannedData.status}
                        </Badge>
                      </span>
                    </div>
                  </div>
                </div>

                {scannedData.status === 'RESERVED' && (
                  <div className="confirm-section">
                    <button
                      className="confirm-button"
                      onClick={handleConfirmUse}
                      disabled={confirmUseMutation.isLoading}
                    >
                      {confirmUseMutation.isLoading ? 'Onaylanıyor...' : '✅ Kullanımı Onayla'}
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {scannedData && !userInfo && (
          <Card>
            <CardContent>
              <div className="error-state">
                <p>QR kod doğrulandı ancak kullanıcı bilgileri bulunamadı</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

