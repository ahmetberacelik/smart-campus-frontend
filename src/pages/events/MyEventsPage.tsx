import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { eventService } from '@/services/api/event.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { QrCodeDisplay } from '@/components/qr/QrCodeDisplay';
import './MyEventsPage.css';

export const MyEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: registrationsData, isLoading } = useQuery(
    'my-events',
    () => eventService.getMyEvents(),
    {
      retry: 1,
      onError: (_err: any) => {
        toast.error('Etkinlik kayıtlarınız yüklenirken bir hata oluştu');
      },
    }
  );

  // Backend RegistrationResponse listesi dönüyor
  const registrations = registrationsData?.data || [];

  const cancelRegistrationMutation = useMutation(
    (eventId: string) => eventService.cancelRegistration(eventId),
    {
      onSuccess: () => {
        toast.success('Kayıt iptal edildi');
        queryClient.invalidateQueries('my-events');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Kayıt iptal edilirken bir hata oluştu');
      },
    }
  );

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcomingList = registrations.filter((reg: any) => {
      const eventDate = reg.eventDate ? parseISO(reg.eventDate) : null;
      return eventDate && eventDate >= now && reg.status === 'REGISTERED';
    });
    const pastList = registrations.filter((reg: any) => {
      const eventDate = reg.eventDate ? parseISO(reg.eventDate) : null;
      return !eventDate || eventDate < now || reg.status !== 'REGISTERED';
    });
    return { upcoming: upcomingList, past: pastList };
  }, [registrations]);

  const handleCancel = (registration: any) => {
    if (window.confirm('Bu etkinlik kaydını iptal etmek istediğinize emin misiniz?')) {
      const eventId = registration.eventId;
      if (eventId) {
        cancelRegistrationMutation.mutate(eventId.toString());
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REGISTERED':
        return <Badge variant="success">Kayıtlı</Badge>;
      case 'CHECKED_IN':
        return <Badge variant="primary">Giriş Yapıldı</Badge>;
      case 'WAITLIST':
        return <Badge variant="warning">Yedek Liste</Badge>;
      case 'CANCELLED':
        return <Badge variant="error">İptal Edildi</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="my-events-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="my-events-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Etkinliklerim' },
        ]}
      />
      <PageHeader
        title="Etkinliklerim"
        description="Kayıtlı olduğunuz etkinlikleri görüntüleyin"
      />

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <div className="events-section">
          <h2>Yaklaşan Etkinlikler ({upcoming.length})</h2>
          <div className="events-grid">
            {upcoming.map((registration: any) => {
              const eventDate = registration.eventDate ? parseISO(registration.eventDate) : null;

              return (
                <Card key={registration.id} className="event-registration-card">
                  <CardHeader>
                    <div className="event-card-header">
                      <CardTitle>{registration.eventTitle || 'Etkinlik'}</CardTitle>
                      {getStatusBadge(registration.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {eventDate && (
                      <div className="event-date">
                        {format(eventDate, 'd MMMM yyyy EEEE', { locale: tr })}
                      </div>
                    )}
                    {registration.eventLocation && (
                      <div className="event-location">📍 {registration.eventLocation}</div>
                    )}

                    {registration.qrCode && (
                      <div className="event-qr">
                        <QrCodeDisplay
                          value={registration.qrCode}
                          size={150}
                          title="Etkinlik QR Kodu"
                          description="Etkinlikte bu QR kodu gösterin"
                          showFullScreen={true}
                        />
                      </div>
                    )}

                    <div className="event-actions">
                      {registration.eventId && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/events/${registration.eventId}`)}
                        >
                          Detaylar
                        </Button>
                      )}
                      {registration.status === 'REGISTERED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancel(registration)}
                          disabled={cancelRegistrationMutation.isLoading}
                        >
                          Kaydı İptal Et
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Events */}
      {past.length > 0 && (
        <div className="events-section">
          <h2>Geçmiş Etkinlikler ({past.length})</h2>
          <div className="events-grid">
            {past.map((registration: any) => {
              const eventDate = registration.eventDate ? parseISO(registration.eventDate) : null;

              return (
                <Card key={registration.id} className="event-registration-card past">
                  <CardHeader>
                    <div className="event-card-header">
                      <CardTitle>{registration.eventTitle || 'Etkinlik'}</CardTitle>
                      {getStatusBadge(registration.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {eventDate && (
                      <div className="event-date">
                        {format(eventDate, 'd MMMM yyyy EEEE', { locale: tr })}
                      </div>
                    )}
                    {registration.eventLocation && (
                      <div className="event-location">📍 {registration.eventLocation}</div>
                    )}
                    {registration.status === 'CHECKED_IN' && (
                      <div className="check-in-status">✅ Etkinliğe katıldınız</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {registrations.length === 0 && (
        <Card className="empty-state-card">
          <CardContent>
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor" />
              </svg>
              <h3>Henüz etkinlik kaydınız yok</h3>
              <p>Etkinlikler sayfasından etkinliklere kayıt olabilirsiniz</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

