import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { attendanceService } from '@/services/api/attendance.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { TextInput } from '@/components/common/TextInput';
import type { AttendanceSession } from '@/types/api.types';
import './MyAttendancePage.css';

export const MyAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [excuseModalOpen, setExcuseModalOpen] = useState(false);
  const [excuseReason, setExcuseReason] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  // Aktif yoklama oturumları (öğrencinin kayıtlı olduğu derslerde)
  const { data: activeSessionsData } = useQuery(
    'active-sessions',
    () => attendanceService.getActiveSessions(),
    {
      retry: 1,
      refetchInterval: 30000, // Her 30 saniyede bir yenile
    }
  );

  const { data: attendanceData, isLoading, error } = useQuery(
    'my-attendance',
    () => attendanceService.getMyAttendance(),
    {
      retry: 1,
      onError: (err: any) => {
        const statusCode = err?.response?.status || err?.status;
        if (statusCode === 401) {
          toast.error('Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.');
          setTimeout(() => {
            localStorage.clear();
            navigate('/login');
          }, 2000);
        } else {
          toast.error('Yoklama bilgileri yüklenirken bir hata oluştu');
        }
      },
    }
  );

  // Backend doğrudan array döndürüyor, courses wrapper yok
  const attendance = attendanceData?.data || [];
  const activeSessions = activeSessionsData?.data || [];

  const handleSubmitExcuse = async () => {
    if (!excuseReason.trim()) {
      toast.error('Lütfen mazeret nedeninizi belirtin');
      return;
    }

    try {
      await attendanceService.createExcuseRequest({
        sessionId: selectedSessionId,
        reason: excuseReason,
      });
      toast.success('Mazeret talebiniz gönderildi');
      setExcuseModalOpen(false);
      setExcuseReason('');
      setSelectedSessionId('');
    } catch (error: any) {
      toast.error(error?.message || 'Mazeret talebi gönderilirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="my-attendance-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    const errorData = error as any;
    const statusCode = errorData?.response?.status || errorData?.status;
    
    if (statusCode === 401) {
      return (
        <div className="my-attendance-page">
          <div className="error-message">
            <h3>Kimlik Doğrulama Gerekli</h3>
            <p>Oturumunuzun süresi dolmuş olabilir. Lütfen tekrar giriş yapın.</p>
            <Button 
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}
              style={{ marginTop: '1rem' }}
            >
              Giriş Sayfasına Dön
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="my-attendance-page">
        <div className="error-message">
          <h3>Hata Oluştu</h3>
          <p>{errorData?.message || 'Yoklama bilgileri yüklenirken bir hata oluştu'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-attendance-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Yoklama Durumum' },
        ]}
      />
      <PageHeader
        title="Yoklama Durumum"
        description="Tüm dersleriniz için yoklama durumunuzu görüntüleyebilir ve mazeret talebinde bulunabilirsiniz"
      />

      {/* Aktif Yoklama Oturumları */}
      {activeSessions.length > 0 && (
        <div className="active-sessions-section">
          <h2 className="section-title">🟢 Aktif Yoklama Oturumları</h2>
          <p className="section-description">Aşağıdaki derslerde yoklama oturumu açık. Yoklama vermek için tıklayın.</p>
          <div className="active-sessions-grid">
            {activeSessions.map((session: AttendanceSession) => (
              <Card key={session.id} className="active-session-card">
                <CardContent>
                  <div className="active-session-content">
                    <div className="session-info">
                      <h3 className="course-code">{session.courseCode || 'Ders'}</h3>
                      <h4 className="course-name">{session.courseName || 'Bilinmiyor'}</h4>
                      <p className="section-number">Bölüm {session.sectionNumber || '?'}</p>
                      <p className="session-time">
                        {session.date} • {session.startTime?.substring(0, 5)} - {session.endTime?.substring(0, 5)}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(`/attendance/give/${session.id}`)}
                      className="give-attendance-btn"
                    >
                      📍 Yoklama Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Geçmiş Yoklama Durumu */}
      <h2 className="section-title" style={{ marginTop: activeSessions.length > 0 ? '2rem' : 0 }}>
        📊 Geçmiş Yoklama Durumu
      </h2>

      {attendance.length === 0 ? (
        <Card className="empty-state-card">
          <CardContent>
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
              <h3>Henüz yoklama kaydınız bulunmuyor</h3>
              <p>Dersleriniz için yoklama oturumları açıldıkça burada görünecektir</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="attendance-grid">
          {attendance.map((course: any) => {
            const percentage = course.attendancePercentage || 0;
            const status = course.status || 'NORMAL';
            const statusClass = status.toLowerCase();
            const totalSessions = course.totalSessions || 0;
            // Backend: presentCount, excusedCount kullanıyor
            const attendedSessions = course.presentCount || course.attendedSessions || 0;
            const excusedAbsences = course.excusedCount || course.excusedAbsences || 0;
            const absences = course.absentCount || (totalSessions - attendedSessions - excusedAbsences);

            return (
              <Card key={course.sectionId} className="attendance-card">
                <CardHeader>
                  <div className="attendance-card-header">
                    <div>
                      <CardTitle className="course-code">{course.courseCode}</CardTitle>
                      <h4 className="course-name">{course.courseName}</h4>
                    </div>
                    <Badge variant={statusClass === 'critical' ? 'error' : statusClass === 'warning' ? 'warning' : 'success'}>
                      {status === 'NORMAL' ? 'Normal' : status === 'WARNING' ? 'Uyarı' : 'Kritik'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="attendance-stats">
                    <div className="stat-item">
                      <span className="stat-label">Toplam Oturum:</span>
                      <span className="stat-value">{totalSessions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Katılım:</span>
                      <span className="stat-value stat-success">{attendedSessions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Mazeretli:</span>
                      <span className="stat-value stat-info">{excusedAbsences}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Devamsız:</span>
                      <span className="stat-value stat-danger">{absences}</span>
                    </div>
                    <div className="stat-item full-width">
                      <span className="stat-label">Yoklama Oranı:</span>
                      <span className={`stat-value stat-percentage stat-${statusClass}`}>
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

                  {/* Eksik Oturumlar Listesi */}
                  {course.sessions && course.sessions.length > 0 && (
                    <div className="missing-sessions">
                      <h4>Eksik Oturumlar:</h4>
                      <div className="sessions-list">
                        {course.sessions
                          .filter((session: any) => session.status === 'ABSENT' && !session.excuseStatus)
                          .map((session: any) => (
                            <div key={session.sessionId} className="session-item">
                              <div className="session-info">
                                <span className="session-date">
                                  {new Date(session.date).toLocaleDateString('tr-TR')}
                                </span>
                                <span className="session-time">
                                  {session.startTime ? new Date(`2000-01-01T${session.startTime}`).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                                {session.excuseStatus && (
                                  <Badge variant={session.excuseStatus === 'APPROVED' ? 'success' : session.excuseStatus === 'REJECTED' ? 'error' : 'warning'}>
                                    {session.excuseStatus === 'APPROVED' ? 'Onaylandı' : session.excuseStatus === 'REJECTED' ? 'Reddedildi' : 'Beklemede'}
                                  </Badge>
                                )}
                              </div>
                              {!session.excuseStatus && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSessionId(session.sessionId.toString());
                                    setExcuseModalOpen(true);
                                  }}
                                >
                                  Mazeret Talebinde Bulun
                                </Button>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {percentage < 80 && absences > 0 && (
                    <div className="attendance-warning">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                      </svg>
                      <span>Yoklama oranınız %80'in altında. Lütfen devamsız olduğunuz dersler için mazeret talebinde bulunun.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Excuse Request Modal */}
      <Modal
        isOpen={excuseModalOpen}
        onClose={() => {
          setExcuseModalOpen(false);
          setExcuseReason('');
          setSelectedSessionId('');
        }}
        title="Mazeret Talebi"
        size="md"
      >
        <div className="excuse-modal-content">
          <div className="excuse-info">
            <p>Lütfen mazeret nedeninizi detaylı olarak açıklayın:</p>
          </div>
          <TextInput
            type="textarea"
            placeholder="Mazeret nedeninizi buraya yazın..."
            value={excuseReason}
            onChange={(e) => setExcuseReason(e.target.value)}
            rows={5}
          />
          <div className="excuse-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setExcuseModalOpen(false);
                setExcuseReason('');
                setSelectedSessionId('');
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmitExcuse}
              disabled={!excuseReason.trim()}
            >
              Gönder
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
