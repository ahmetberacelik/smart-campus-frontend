import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { attendanceService, type CheckInRequest } from '@/services/api/attendance.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent } from '@/components/ui/Card';
import './GiveAttendancePage.css';

export const GiveAttendancePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<{ lat: number; lon: number; accuracy: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Get session details
  const { data: sessionData, isLoading: sessionLoading } = useQuery(
    ['session', sessionId],
    () => attendanceService.getSessionById(sessionId!),
    {
      enabled: !!sessionId,
      retry: 1,
      onError: (err: any) => {
        toast.error('Yoklama oturumu bilgileri yüklenirken bir hata oluştu');
      },
    }
  );

  const session = sessionData?.data;

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
            errorMessage = 'Konum bilgisi alınamıyor.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Konum alma işlemi zaman aşımına uğradı.';
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
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

  // Calculate distance (simplified - using Haversine would be better but this is for display)
  const calculateDistance = () => {
    if (!session || !location) return null;
    // Simplified distance calculation (would need proper Haversine formula)
    return 'Hesaplanıyor...';
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

  const distance = calculateDistance();

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
            <div className="session-info">
              <h3>Oturum Bilgileri</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Ders:</span>
                  <span className="info-value">{session.courseCode} - {session.courseName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tarih:</span>
                  <span className="info-value">
                    {new Date(session.date || session.startTime).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Saat:</span>
                  <span className="info-value">
                    {new Date(session.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(session.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
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

            <div className="location-section">
              <h3>Konum Bilgisi</h3>
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
                  {distance && (
                    <div className="distance-info">
                      <span>Sınıfa Uzaklık: {distance}</span>
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    onClick={getCurrentLocation}
                    size="sm"
                  >
                    Konumu Yenile
                  </Button>
                </div>
              )}
            </div>

            <div className="action-section">
              <Button
                onClick={handleCheckIn}
                disabled={!location || checkInMutation.isLoading}
                fullWidth
                size="lg"
              >
                {checkInMutation.isLoading ? 'Yoklama Veriliyor...' : 'Yoklama Ver'}
              </Button>
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
