import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { attendanceService, type CheckInRequest } from '@/services/api/attendance.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import './AttendancePage.css';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number; accuracy: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');

  const isStudent = user?.role?.toLowerCase() === 'student' || user?.role === 'STUDENT';
  const isFaculty = user?.role?.toLowerCase() === 'faculty' || user?.role === 'FACULTY';

  // Get user's location
  useEffect(() => {
    if (isStudent && selectedSession) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              accuracy: position.coords.accuracy || 0,
            });
            setLocationError('');
          },
          (error) => {
            setLocationError('Konum alınamadı. Lütfen tarayıcı ayarlarınızdan konum iznini açın.');
            console.error('Geolocation error:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        setLocationError('Tarayıcınız konum servisini desteklemiyor.');
      }
    }
  }, [isStudent, selectedSession]);

  // Student: Get my attendance
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    'my-attendance',
    () => attendanceService.getMyAttendance(),
    {
      enabled: isStudent,
      retry: 1,
    }
  );

  // Faculty: Get my sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery(
    'my-sessions',
    () => attendanceService.getMySessions(),
    {
      enabled: isFaculty,
      retry: 1,
    }
  );

  const checkInMutation = useMutation(
    ({ sessionId, data }: { sessionId: string; data: CheckInRequest }) =>
      attendanceService.checkIn(sessionId, data),
    {
      onSuccess: (_response) => {
        toast.success('Yoklama başarıyla verildi');
        setSelectedSession(null);
        queryClient.invalidateQueries('my-attendance');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Yoklama verilirken bir hata oluştu');
      },
    }
  );

  const handleCheckIn = async () => {
    if (!selectedSession || !location) {
      toast.error('Konum bilgisi alınamadı');
      return;
    }

    const checkInData: CheckInRequest = {
      latitude: location.lat,
      longitude: location.lon,
      accuracy: location.accuracy,
    };

    try {
      await checkInMutation.mutateAsync({
        sessionId: selectedSession.id,
        data: checkInData,
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  if (attendanceLoading || sessionsLoading) {
    return (
      <div className="attendance-page">
        <LoadingSpinner />
      </div>
    );
  }

  // Student View
  if (isStudent) {
    const attendance = attendanceData?.data?.courses || [];

    return (
      <div className="attendance-page">
        <div className="attendance-header">
          <h1>Yoklama Durumum</h1>
          <p className="subtitle">Tüm dersleriniz için yoklama durumunuzu görüntüleyebilirsiniz</p>
        </div>

        {attendance.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" />
            </svg>
            <h3>Henüz yoklama kaydınız bulunmuyor</h3>
          </div>
        ) : (
          <div className="attendance-grid">
            {attendance.map((course: any) => {
              const percentage = course.attendancePercentage || 0;
              const status = course.status || 'NORMAL';
              const statusClass = status.toLowerCase();

              return (
                <div key={course.sectionId} className="attendance-card">
                  <div className="attendance-card-header">
                    <div>
                      <h3 className="course-code">{course.courseCode}</h3>
                      <h4 className="course-name">{course.courseName}</h4>
                    </div>
                    <span className={`status-badge status-${statusClass}`}>
                      {status === 'NORMAL' ? 'Normal' : status === 'WARNING' ? 'Uyarı' : 'Kritik'}
                    </span>
                  </div>

                  <div className="attendance-stats">
                    <div className="stat-item">
                      <span className="stat-label">Toplam Oturum:</span>
                      <span className="stat-value">{course.totalSessions || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Katılım:</span>
                      <span className="stat-value">{course.attendedSessions || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Yoklama Oranı:</span>
                      <span className={`stat-value stat-percentage ${statusClass}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="attendance-progress">
                    <div className="progress-bar">
                      <div
                        className={`progress-fill progress-${statusClass}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Check-in Modal */}
        {selectedSession && (
          <div className="modal-overlay" onClick={() => setSelectedSession(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Yoklama Ver</h2>
                <button className="modal-close" onClick={() => setSelectedSession(null)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                {locationError ? (
                  <div className="error-message">{locationError}</div>
                ) : !location ? (
                  <div className="loading-location">
                    <LoadingSpinner />
                    <p>Konum bilgisi alınıyor...</p>
                  </div>
                ) : (
                  <>
                    <div className="location-info">
                      <p><strong>Ders:</strong> {selectedSession.courseCode} - {selectedSession.courseName}</p>
                      <p><strong>Konum:</strong> {location.lat.toFixed(6)}, {location.lon.toFixed(6)}</p>
                      <p><strong>Doğruluk:</strong> ±{location.accuracy.toFixed(0)}m</p>
                    </div>
                    <Button
                      onClick={handleCheckIn}
                      disabled={checkInMutation.isLoading}
                      fullWidth
                    >
                      {checkInMutation.isLoading ? 'Yoklama Veriliyor...' : 'Yoklama Ver'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Faculty View
  if (isFaculty) {
    const sessions = sessionsData?.data || [];

    return (
      <div className="attendance-page">
        <div className="attendance-header">
          <h1>Yoklama Oturumları</h1>
          <Button onClick={() => toast.info('Yoklama oturumu oluşturma özelliği yakında eklenecek')}>
            Yeni Oturum Oluştur
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <h3>Henüz yoklama oturumu oluşturulmamış</h3>
          </div>
        ) : (
          <div className="sessions-grid">
            {sessions.map((session: any) => (
              <div key={session.id} className="session-card">
                <div className="session-card-header">
                  <div>
                    <h3 className="course-code">{session.courseCode}</h3>
                    <h4 className="course-name">{session.courseName}</h4>
                  </div>
                  <span className={`status-badge status-${session.status?.toLowerCase()}`}>
                    {session.status === 'OPEN' ? 'Açık' : 'Kapalı'}
                  </span>
                </div>

                <div className="session-details">
                  <div className="detail-item">
                    <span className="detail-label">Tarih:</span>
                    <span className="detail-value">
                      {new Date(session.date).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Saat:</span>
                    <span className="detail-value">
                      {new Date(session.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} -
                      {new Date(session.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Geofence Radius:</span>
                    <span className="detail-value">{session.geofenceRadius}m</span>
                  </div>
                </div>

                <div className="session-actions">
                  {session.status === 'OPEN' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        attendanceService.closeSession(session.id).then(() => {
                          toast.success('Oturum kapatıldı');
                          queryClient.invalidateQueries('my-sessions');
                        });
                      }}
                    >
                      Oturumu Kapat
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast.info('Yoklama raporu özelliği yakında eklenecek')}
                  >
                    Rapor Görüntüle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="attendance-page">
      <div className="error-message">Bu sayfaya erişim yetkiniz yok</div>
    </div>
  );
};

