import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import { attendanceService } from '@/services/api/attendance.service';
import './AttendanceSessionPage.css';

export const AttendanceSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Oturum detaylarını getir
  const {
    data: sessionData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['attendanceSession', sessionId],
    () => attendanceService.getSessionById(sessionId!),
    {
      enabled: !!sessionId,
      refetchInterval: 30000, // Her 30 saniyede bir yenile
    }
  );

  const session = sessionData?.data;

  // Oturumu kapatma mutation
  const closeSessionMutation = useMutation(
    () => attendanceService.closeSession(sessionId!),
    {
      onSuccess: () => {
        toast.success('Yoklama oturumu kapatıldı');
        queryClient.invalidateQueries(['attendanceSession', sessionId]);
        navigate('/sections');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Oturum kapatılırken bir hata oluştu');
      },
    }
  );

  // Tarih ve saati birleştirerek Date objesi oluştur
  const createDateTime = (dateStr: string | undefined, timeStr: string | undefined): Date | null => {
    if (!dateStr || !timeStr) return null;
    try {
      // Backend LocalDate (2025-12-16) ve LocalTime (19:30:00) döndürüyor
      return new Date(`${dateStr}T${timeStr}`);
    } catch {
      return null;
    }
  };

  // Kalan süreyi hesapla
  useEffect(() => {
    if (!session?.date || !session?.endTime) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const end = createDateTime(session.date, session.endTime);
      
      if (!end) {
        setTimeRemaining('');
        return;
      }

      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Süre doldu');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}s ${minutes}d ${seconds}sn`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}d ${seconds}sn`);
      } else {
        setTimeRemaining(`${seconds}sn`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [session?.date, session?.endTime]);

  const handleCloseSession = () => {
    if (window.confirm('Yoklama oturumunu kapatmak istediğinizden emin misiniz?')) {
      closeSessionMutation.mutate();
    }
  };

  // Backend LocalTime döndürüyor (örn: "19:30:00")
  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '--:--';
    try {
      // LocalTime formatı: "19:30:00" veya "19:30"
      const parts = timeStr.split(':');
      return `${parts[0]}:${parts[1]}`;
    } catch {
      return '--:--';
    }
  };

  // Backend LocalDate döndürüyor (örn: "2025-12-16")
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="session-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Oturum yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="session-page">
        <div className="error-container">
          <h2>Oturum Bulunamadı</h2>
          <p>Yoklama oturumu bulunamadı veya erişim izniniz yok.</p>
          <button onClick={() => navigate('/sections')} className="btn-primary">
            Ders Bölümlerine Dön
          </button>
        </div>
      </div>
    );
  }

  const isActive = session.status === 'active' || session.status === 'ACTIVE';
  // Backend doğrudan bu alanları döndürüyor
  const courseName = session.courseName || 'Ders';
  const courseCode = session.courseCode || '';
  const sectionNumber = session.sectionNumber || '';

  return (
    <div className="session-page">
      <div className="session-header">
        <div className="session-title">
          <h1>{courseName}</h1>
          <p className="course-info">
            {courseCode} - Bölüm {sectionNumber}
          </p>
        </div>
        <div className={`session-status ${isActive ? 'active' : 'closed'}`}>
          {isActive ? '🟢 Aktif' : '🔴 Kapalı'}
        </div>
      </div>

      <div className="session-content">
        {/* QR Kod Bölümü */}
        <div className="qr-section">
          <div className="qr-container">
            {session.qrCode ? (
              <QRCodeSVG
                value={session.qrCode}
                size={280}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#1a365d"
              />
            ) : (
              <div className="qr-placeholder">
                <p>QR Kod Oluşturuluyor...</p>
              </div>
            )}
          </div>
          <p className="qr-instruction">
            Öğrenciler bu QR kodu tarayarak yoklama verebilir
          </p>
        </div>

        {/* Oturum Bilgileri */}
        <div className="session-details">
          <div className="detail-card">
            <h3>📅 Tarih ve Saat</h3>
            <p className="date">{formatDate(session.date)}</p>
            <p className="time">
              {formatTime(session.startTime)} - {formatTime(session.endTime)}
            </p>
          </div>

          {isActive && timeRemaining && (
            <div className="detail-card time-remaining">
              <h3>⏱️ Kalan Süre</h3>
              <p className="countdown">{timeRemaining}</p>
            </div>
          )}

          <div className="detail-card">
            <h3>📍 Konum Bilgileri</h3>
            <p>Enlem: {session.latitude?.toFixed(6)}</p>
            <p>Boylam: {session.longitude?.toFixed(6)}</p>
            <p>Geofence: {session.geofenceRadius}m</p>
          </div>

          <div className="detail-card">
            <h3>ℹ️ Oturum ID</h3>
            <p className="session-id">#{session.id}</p>
          </div>
        </div>
      </div>

      {/* Aksiyon Butonları */}
      <div className="session-actions">
        {isActive && (
          <button
            onClick={handleCloseSession}
            className="btn-danger"
            disabled={closeSessionMutation.isLoading}
          >
            {closeSessionMutation.isLoading ? 'Kapatılıyor...' : '🔒 Oturumu Kapat'}
          </button>
        )}

        <button
          onClick={() => refetch()}
          className="btn-secondary"
        >
          🔄 Yenile
        </button>

        <button
          onClick={() => navigate('/sections')}
          className="btn-outline"
        >
          ← Geri Dön
        </button>
      </div>
    </div>
  );
};

