import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { format, parseISO, differenceInHours } from 'date-fns';
import { tr } from 'date-fns/locale';
import { mealService } from '@/services/api/meal.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { QrCodeDisplay } from '@/components/qr/QrCodeDisplay';
import './MyReservationsPage.css';

export const MyReservationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  // selectedQrCode removed - not used

  const { data: reservationsData, isLoading, error: reservationsError } = useQuery(
    'my-reservations',
    () => mealService.getMyReservations(),
    {
      retry: 1,
      onError: (err: any) => {
        console.error('Reservations fetch error:', err);
      },
    }
  );

  // Backend Spring'de Page<ReservationResponse> döndürüyor.
  // Hem Page yapısını hem de düz array'i destekleyecek şekilde normalize ediyoruz.
  const pageData = reservationsData?.data;
  const reservations: any[] = Array.isArray(pageData?.content)
    ? pageData.content
    : Array.isArray(pageData)
      ? pageData
      : [];

  const cancelReservationMutation = useMutation(
    (id: string) => mealService.cancelReservation(id),
    {
      onSuccess: () => {
        toast.success('Rezervasyon iptal edildi');
        queryClient.invalidateQueries('my-reservations');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Rezervasyon iptal edilirken bir hata oluştu');
      },
    }
  );

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcomingList = reservations.filter((res: any) => {
      const dateStr = res.date || res.reservationDate;
      if (!dateStr) return false;
      const resDate = parseISO(dateStr);
      return resDate >= now && res.status === 'RESERVED';
    });
    const pastList = reservations.filter((res: any) => {
      const dateStr = res.date || res.reservationDate;
      if (!dateStr) return false;
      const resDate = parseISO(dateStr);
      return resDate < now || res.status !== 'RESERVED';
    });
    return { upcoming: upcomingList, past: pastList };
  }, [reservations]);

  const handleCancel = (reservation: any) => {
    const dateStr = reservation.date || reservation.reservationDate;
    if (!dateStr) {
      toast.error('Rezervasyon tarihi bulunamadı');
      return;
    }
    const reservationDate = parseISO(dateStr);
    const hoursUntilMeal = differenceInHours(reservationDate, new Date());

    if (hoursUntilMeal < 2) {
      toast.error('Yemekten 2 saat öncesine kadar rezervasyon iptal edilebilir');
      return;
    }

    if (window.confirm(`${format(reservationDate, 'd MMMM yyyy', { locale: tr })} tarihli rezervasyonu iptal etmek istediğinize emin misiniz?`)) {
      cancelReservationMutation.mutate(reservation.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return <Badge variant="success">Rezerve Edildi</Badge>;
      case 'USED':
        return <Badge variant="primary">Kullanıldı</Badge>;
      case 'CANCELLED':
        return <Badge variant="error">İptal Edildi</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getMealTypeLabel = (mealType: string) => {
    return mealType === 'LUNCH' ? 'Öğle Yemeği' : 'Akşam Yemeği';
  };

  if (isLoading) {
    return (
      <div className="my-reservations-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (reservationsError) {
    const errorData = reservationsError as any;
    const statusCode = errorData?.response?.status || errorData?.status;

    return (
      <div className="my-reservations-page">
        <Breadcrumb
          items={[
            { label: 'Ana Sayfa', to: '/dashboard' },
            { label: 'Rezervasyonlarım' },
          ]}
        />
        <PageHeader
          title="Yemek Rezervasyonlarım"
          description="Yaklaşan ve geçmiş yemek rezervasyonlarınızı görüntüleyin"
        />
        <Card>
          <CardContent>
            <div className="error-message" style={{ padding: '2rem', textAlign: 'center' }}>
              <h3>Rezervasyonlar yüklenirken bir hata oluştu</h3>
              <p>{errorData?.response?.data?.message || errorData?.message || 'Lütfen daha sonra tekrar deneyin'}</p>
              {statusCode === 401 && (
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                  Oturumunuzun süresi dolmuş olabilir. Lütfen sayfayı yenileyin.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="my-reservations-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Rezervasyonlarım' },
        ]}
      />
      <PageHeader
        title="Yemek Rezervasyonlarım"
        description="Yaklaşan ve geçmiş yemek rezervasyonlarınızı görüntüleyin"
      />

      {/* Upcoming Reservations */}
      {upcoming.length > 0 && (
        <div className="reservations-section">
          <h2>Yaklaşan Rezervasyonlar ({upcoming.length})</h2>
          <div className="reservations-grid">
            {upcoming.map((reservation: any) => {
              const dateStr = reservation.date || reservation.reservationDate;
              const reservationDate = dateStr ? parseISO(dateStr) : new Date();
              const hoursUntilMeal = differenceInHours(reservationDate, new Date());
              const canCancel = hoursUntilMeal >= 2;

              return (
                <Card key={reservation.id} className="reservation-card">
                  <CardHeader>
                    <div className="reservation-card-header">
                      <CardTitle>{format(reservationDate, 'd MMMM yyyy EEEE', { locale: tr })}</CardTitle>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="reservation-details">
                      <div className="detail-item">
                        <span className="detail-label">Öğün:</span>
                        <span className="detail-value">{getMealTypeLabel(reservation.mealType)}</span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    {reservation.menuItemsJson && (() => {
                      try {
                        const menuItems = JSON.parse(reservation.menuItemsJson);
                        if (Array.isArray(menuItems) && menuItems.length > 0) {
                          return (
                            <div className="reservation-menu-items" style={{ marginTop: '16px', marginBottom: '16px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary, #212121)' }}>Menü:</h4>
                              <div className="menu-items-list">
                                {menuItems.map((item: any, index: number) => (
                                  <div key={index} className="menu-item" style={{ 
                                    padding: '8px 0', 
                                    borderBottom: index < menuItems.length - 1 ? '1px solid #e5e7eb' : 'none' 
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary, #212121)' }}>
                                          {item.name}
                                        </div>
                                        {item.description && (
                                          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)', marginTop: '4px' }}>
                                            {item.description}
                                          </div>
                                        )}
                                      </div>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        {item.isVegan && <Badge variant="success" style={{ fontSize: '10px' }}>🌱 Vegan</Badge>}
                                        {item.isVegetarian && !item.isVegan && <Badge variant="warning" style={{ fontSize: '10px' }}>🥗 Vejetaryen</Badge>}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        console.error('Error parsing menuItemsJson:', e);
                      }
                      return null;
                    })()}

                    {reservation.qrCode && (
                      <div className="reservation-qr">
                        <QrCodeDisplay
                          value={reservation.qrCode}
                          size={150}
                          title="Rezervasyon QR Kodu"
                          description="Yemekhanede bu QR kodu gösterin"
                          showFullScreen={true}
                        />
                      </div>
                    )}

                    {canCancel && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCancel(reservation)}
                        disabled={cancelReservationMutation.isLoading}
                        fullWidth
                        style={{ marginTop: '16px' }}
                      >
                        İptal Et
                      </Button>
                    )}
                    {!canCancel && (
                      <p className="cancel-warning">
                        Yemekten 2 saatten az süre kaldığı için iptal edilemez
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Reservations */}
      {past.length > 0 && (
        <div className="reservations-section">
          <h2>Geçmiş Rezervasyonlar ({past.length})</h2>
          <div className="reservations-grid">
            {past.map((reservation: any) => {
              const dateStr = reservation.date || reservation.reservationDate;
              const reservationDate = dateStr ? parseISO(dateStr) : new Date();

              return (
                <Card key={reservation.id} className="reservation-card past">
                  <CardHeader>
                    <div className="reservation-card-header">
                      <CardTitle>{format(reservationDate, 'd MMMM yyyy EEEE', { locale: tr })}</CardTitle>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="reservation-details">
                      <div className="detail-item">
                        <span className="detail-label">Öğün:</span>
                        <span className="detail-value">{getMealTypeLabel(reservation.mealType)}</span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    {reservation.menuItemsJson && (() => {
                      try {
                        const menuItems = JSON.parse(reservation.menuItemsJson);
                        if (Array.isArray(menuItems) && menuItems.length > 0) {
                          return (
                            <div className="reservation-menu-items" style={{ marginTop: '16px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary, #212121)' }}>Menü:</h4>
                              <div className="menu-items-list">
                                {menuItems.map((item: any, index: number) => (
                                  <div key={index} className="menu-item" style={{ 
                                    padding: '8px 0', 
                                    borderBottom: index < menuItems.length - 1 ? '1px solid #e5e7eb' : 'none' 
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary, #212121)' }}>
                                          {item.name}
                                        </div>
                                        {item.description && (
                                          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)', marginTop: '4px' }}>
                                            {item.description}
                                          </div>
                                        )}
                                      </div>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        {item.isVegan && <Badge variant="success" style={{ fontSize: '10px' }}>🌱 Vegan</Badge>}
                                        {item.isVegetarian && !item.isVegan && <Badge variant="warning" style={{ fontSize: '10px' }}>🥗 Vejetaryen</Badge>}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        console.error('Error parsing menuItemsJson:', e);
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {reservations.length === 0 && (
        <Card className="empty-state-card">
          <CardContent>
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" />
              </svg>
              <h3>Henüz rezervasyonunuz yok</h3>
              <p>Yemek menüsünden rezervasyon yapabilirsiniz</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

