import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { attendanceService, type CheckInRequest, type CheckInQrRequest } from '@/services/api/attendance.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent } from '@/components/ui/Card';
import { LocationMap } from '@/components/map/LocationMap';
import './GiveAttendancePage.css';

type AttendanceMethod = 'gps' | 'qr';

export const GiveAttendancePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const qrFromUrl = searchParams.get('qr');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<{ lat: number; lon: number; accuracy: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [activeMethod, setActiveMethod] = useState<AttendanceMethod>(qrFromUrl ? 'qr' : 'gps');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedQrCode, setScannedQrCode] = useState<string>(qrFromUrl || '');
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get session details
  const { data: sessionData, isLoading: sessionLoading } = useQuery(
    ['session', sessionId],
    () => attendanceService.getSessionById(sessionId!),
    {
      enabled: !!sessionId,
      retry: 1,
      onError: () => {
        toast.error('Yoklama oturumu bilgileri yüklenirken bir hata oluştu');
      },
    }
  );

  const session = sessionData?.data as any;

  // Session location (classroom location)
  const sessionLocation = useMemo<[number, number] | null>(() => {
    if (session?.latitude && session?.longitude) {
      return [parseFloat(session.latitude), parseFloat(session.longitude)];
    }
    return null;
  }, [session?.latitude, session?.longitude]);

  // User location for map
  const userLocationForMap = useMemo<[number, number] | null>(() => {
    if (location) {
      return [location.lat, location.lon];
    }
    return null;
  }, [location]);

  // GPS ile yoklama mutation
  const checkInMutation = useMutation(
    (data: CheckInRequest) => attendanceService.checkIn(sessionId!, data),
    {
      onSuccess: () => {
        toast.success('Yoklama başarıyla verildi');
        queryClient.invalidateQueries('my-attendance');
        navigate('/my-attendance');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Yoklama verilirken bir hata oluştu');
      },
    }
  );

  // QR ile yoklama mutation
  const checkInQrMutation = useMutation(
    (data: CheckInQrRequest) => attendanceService.checkInWithQr(sessionId!, data),
    {
      onSuccess: () => {
        toast.success('Yoklama başarıyla verildi');
        queryClient.invalidateQueries('my-attendance');
        stopScanning();
        navigate('/my-attendance');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Yoklama verilirken bir hata oluştu');
      },
    }
  );

  // QR Kod URL'den geldiğinde otomatik işlem
  useEffect(() => {
    if (qrFromUrl && !location && !isGettingLocation) {
      // QR URL'den geldiyse otomatik konum al
      toast.info('QR kod algılandı, konum alınıyor...');
      getCurrentLocationAuto();
    }
  }, [qrFromUrl]);

  // Konum alındığında ve QR varsa otomatik yoklama ver
  useEffect(() => {
    if (qrFromUrl && location && !autoSubmitting && scannedQrCode) {
      setAutoSubmitting(true);
      toast.info('Konum alındı, yoklama veriliyor...');

      const qrData: CheckInQrRequest = {
        qrCode: scannedQrCode,
        latitude: location.lat,
        longitude: location.lon,
        accuracy: location.accuracy,
      };

      checkInQrMutation.mutate(qrData);
    }
  }, [location, qrFromUrl, scannedQrCode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Otomatik konum alma (QR URL için)
  const getCurrentLocationAuto = () => {
    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum servisini desteklemiyor.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Konum alınamadı.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Konum izni reddedildi. Lütfen konum iznini açın.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Konum bilgisi alınamıyor.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Konum alma işlemi zaman aşımına uğradı.';
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum servisini desteklemiyor.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
        });
        setLocationError('');
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Konum alınamadı.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini açın.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Konum bilgisi alınamıyor. GPS veya internet bağlantınızı kontrol edin.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Konum alma işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.';
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: false, // false = daha hızlı ama daha az hassas
        timeout: 30000, // 30 saniye
        maximumAge: 60000, // 1 dakikaya kadar eski konum kabul edilir
      }
    );
  };

  const handleCheckIn = async () => {
    if (!location) {
      toast.error('Lütfen önce konum bilgisi alın');
      return;
    }

    const checkInData: CheckInRequest = {
      latitude: location.lat,
      longitude: location.lon,
      accuracy: location.accuracy,
    };

    await checkInMutation.mutateAsync(checkInData);
  };

  // QR Tarama fonksiyonları
  const startScanning = async () => {
    try {
      // Önce konum al
      if (!location) {
        getCurrentLocation();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsScanning(true);
      scanQrCode();
    } catch (error) {
      toast.error('Kamera açılamadı. Lütfen kamera iznini kontrol edin.');
      console.error('Camera error:', error);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setScannedQrCode('');
  };

  const scanQrCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanQrCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // jsQR kütüphanesi olmadan basit Base64 QR kod algılama denemesi
      // Gerçek uygulamada jsQR veya html5-qrcode kullanılmalı
      // QR kod algılama için harici kütüphane gerekli
      // Şimdilik manuel giriş yöntemi ekleyelim
    } catch (e) {
      console.error('QR scan error:', e);
    }

    if (isScanning) {
      requestAnimationFrame(scanQrCode);
    }
  };

  const handleManualQrSubmit = async () => {
    if (!scannedQrCode.trim()) {
      toast.error('Lütfen QR kodu girin');
      return;
    }

    // Konum al
    if (!location) {
      toast.error('Lütfen önce konum bilgisi alın');
      getCurrentLocation();
      return;
    }

    const qrData: CheckInQrRequest = {
      qrCode: scannedQrCode.trim(),
      latitude: location.lat,
      longitude: location.lon,
      accuracy: location.accuracy,
    };

    await checkInQrMutation.mutateAsync(qrData);
  };

  if (sessionLoading) {
    return (
      <div className="give-attendance-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="give-attendance-page">
        <div className="error-message">
          <h3>Yoklama oturumu bulunamadı</h3>
          <Button onClick={() => navigate('/my-attendance')}>Yoklama Durumuna Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="give-attendance-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Yoklama Durumum', to: '/my-attendance' },
          { label: 'Yoklama Ver' },
        ]}
      />
      <PageHeader
        title="Yoklama Ver"
        description={`${session.courseCode || ''} - ${session.courseName || ''}`}
      />

      <div className="give-attendance-container">
        <Card>
          <CardContent>
            {/* Method Selection Tabs */}
            <div className="method-tabs">
              <button
                className={`method-tab ${activeMethod === 'gps' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMethod('gps');
                  stopScanning();
                }}
              >
                📍 GPS ile Yoklama
              </button>
              <button
                className={`method-tab ${activeMethod === 'qr' ? 'active' : ''}`}
                onClick={() => setActiveMethod('qr')}
              >
                📷 QR ile Yoklama
              </button>
            </div>

            <div className="session-info">
              <h3>Oturum Bilgileri</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Ders:</span>
                  <span className="info-value">
                    {session.courseCode || session.courseName
                      ? `${session.courseCode || ''} - ${session.courseName || ''}`
                      : 'Ders bilgisi yükleniyor...'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tarih:</span>
                  <span className="info-value">
                    {session.date
                      ? new Date(session.date).toLocaleDateString('tr-TR')
                      : '-'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Saat:</span>
                  <span className="info-value">
                    {session.startTime && session.endTime
                      ? `${session.startTime.substring(0, 5)} - ${session.endTime.substring(0, 5)}`
                      : '-'}
                  </span>
                </div>
                {session.classroomName && (
                  <div className="info-item">
                    <span className="info-label">Sınıf:</span>
                    <span className="info-value">{session.classroomName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* GPS Method */}
            {activeMethod === 'gps' && (
              <div className="location-section">
                <h3>📍 Konum Bilgisi</h3>
                {!location ? (
                  <div className="location-placeholder">
                    {locationError ? (
                      <div className="error-message-text">{locationError}</div>
                    ) : (
                      <p>Yoklama vermek için konum bilginize ihtiyacımız var.</p>
                    )}
                    <Button
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      fullWidth
                    >
                      {isGettingLocation ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Konum Alınıyor...
                        </>
                      ) : (
                        'Konum Bilgisi Al'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="location-display">
                    <div className="location-coords">
                      <div className="coord-item">
                        <span className="coord-label">Enlem:</span>
                        <span className="coord-value">{location.lat.toFixed(6)}</span>
                      </div>
                      <div className="coord-item">
                        <span className="coord-label">Boylam:</span>
                        <span className="coord-value">{location.lon.toFixed(6)}</span>
                      </div>
                      <div className="coord-item">
                        <span className="coord-label">Doğruluk:</span>
                        <span className="coord-value">±{location.accuracy.toFixed(0)}m</span>
                      </div>
                    </div>
                    {sessionLocation && (
                      <div className="location-map-container">
                        <LocationMap
                          center={sessionLocation}
                          userLocation={userLocationForMap || undefined}
                          radius={session?.geofenceRadius || 15}
                          height="250px"
                          showDistance={true}
                          targetLabel={session?.classroomName || 'Sınıf Konumu'}
                          userLabel="Konumunuz"
                        />
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      onClick={getCurrentLocation}
                      size="sm"
                      style={{ marginTop: '12px' }}
                    >
                      Konumu Yenile
                    </Button>
                  </div>
                )}

                <div className="action-section">
                  <Button
                    onClick={handleCheckIn}
                    disabled={!location || checkInMutation.isLoading}
                    fullWidth
                    size="lg"
                  >
                    {checkInMutation.isLoading ? 'Yoklama Veriliyor...' : 'Yoklama Ver'}
                  </Button>
                </div>
              </div>
            )}

            {/* QR Method */}
            {activeMethod === 'qr' && (
              <div className="qr-section">
                <h3>📷 QR Kod ile Yoklama</h3>

                {/* Konum bilgisi de gerekli */}
                {!location && (
                  <div className="qr-location-warning">
                    <p>⚠️ QR ile yoklama için de konum bilginiz gereklidir.</p>
                    <Button
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      variant="secondary"
                      size="sm"
                    >
                      {isGettingLocation ? 'Konum Alınıyor...' : 'Konum Al'}
                    </Button>
                  </div>
                )}

                {location && (
                  <div className="location-mini">
                    ✅ Konum: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                  </div>
                )}

                {/* Kamera ile tarama */}
                <div className="qr-scanner-section">
                  {isScanning ? (
                    <div className="scanner-active">
                      <video
                        ref={videoRef}
                        className="scanner-video"
                        playsInline
                        autoPlay
                        muted
                      />
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                      <Button
                        variant="secondary"
                        onClick={stopScanning}
                        fullWidth
                      >
                        Taramayı Durdur
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={startScanning}
                      fullWidth
                      disabled={!location}
                    >
                      📷 Kamerayı Aç ve Tara
                    </Button>
                  )}
                </div>

                {/* Manuel QR girişi */}
                <div className="manual-qr-section">
                  <p className="manual-hint">veya QR kodu manuel olarak girin:</p>
                  <input
                    type="text"
                    className="qr-input"
                    placeholder="QR kod içeriğini yapıştırın..."
                    value={scannedQrCode}
                    onChange={(e) => setScannedQrCode(e.target.value)}
                  />
                  <Button
                    onClick={handleManualQrSubmit}
                    disabled={!scannedQrCode.trim() || !location || checkInQrMutation.isLoading}
                    fullWidth
                  >
                    {checkInQrMutation.isLoading ? 'Yoklama Veriliyor...' : 'QR ile Yoklama Ver'}
                  </Button>
                </div>
              </div>
            )}

            <div className="cancel-section">
              <Button
                variant="secondary"
                onClick={() => navigate('/my-attendance')}
                fullWidth
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
