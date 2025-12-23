import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { reservationService } from '@/services/api/reservation.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { Select } from '@/components/common/Select';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import './ClassroomReservationsPage.css';

export const ClassroomReservationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [buildingFilter, setBuildingFilter] = useState<string>('');
  const [capacityFilter, setCapacityFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [reservationDate, setReservationDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [reservationStartTime, setReservationStartTime] = useState<string>('09:00');
  const [reservationEndTime, setReservationEndTime] = useState<string>('10:00');
  const [reservationPurpose, setReservationPurpose] = useState<string>('');

  const { data: classroomsData, isLoading: classroomsLoading } = useQuery(
    ['classrooms', buildingFilter, capacityFilter, dateFilter],
    () => reservationService.getClassrooms({
      building: buildingFilter || undefined,
      capacity: capacityFilter ? parseInt(capacityFilter) : undefined,
      date: dateFilter || undefined,
    }),
    {
      retry: 1,
      onError: (err: any) => {
        toast.error('Sınıflar yüklenirken bir hata oluştu');
      },
    }
  );

  const { data: reservationsData, isLoading: reservationsLoading } = useQuery(
    'classroom-reservations',
    () => reservationService.getReservations(),
    {
      retry: 1,
      onError: (err: any) => {
        toast.error('Rezervasyonlar yüklenirken bir hata oluştu');
      },
    }
  );

  const classrooms = classroomsData?.data || [];
  const reservations = reservationsData?.data?.content || reservationsData?.data || [];

  const createReservationMutation = useMutation(
    () => reservationService.createReservation({
      classroomId: selectedClassroom.id,
      date: reservationDate,
      startTime: reservationStartTime,
      endTime: reservationEndTime,
      purpose: reservationPurpose,
    }),
    {
      onSuccess: () => {
        toast.success('Rezervasyon başarıyla oluşturuldu');
        setReservationModalOpen(false);
        setSelectedClassroom(null);
        setReservationPurpose('');
        queryClient.invalidateQueries('classroom-reservations');
        queryClient.invalidateQueries(['classrooms']);
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Rezervasyon oluşturulurken bir hata oluştu');
      },
    }
  );

  const approveReservationMutation = useMutation(
    (id: string) => reservationService.approveReservation(id),
    {
      onSuccess: () => {
        toast.success('Rezervasyon onaylandı');
        queryClient.invalidateQueries('classroom-reservations');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Rezervasyon onaylanırken bir hata oluştu');
      },
    }
  );

  const rejectReservationMutation = useMutation(
    ({ id, reason }: { id: string; reason: string }) =>
      reservationService.rejectReservation(id, reason),
    {
      onSuccess: () => {
        toast.success('Rezervasyon reddedildi');
        queryClient.invalidateQueries('classroom-reservations');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Rezervasyon reddedilirken bir hata oluştu');
      },
    }
  );

  const handleReserve = (classroom: any) => {
    setSelectedClassroom(classroom);
    setReservationModalOpen(true);
  };

  const handleConfirmReservation = () => {
    if (!reservationPurpose.trim()) {
      toast.error('Lütfen rezervasyon amacını belirtin');
      return;
    }

    const start = new Date(`${reservationDate}T${reservationStartTime}`);
    const end = new Date(`${reservationDate}T${reservationEndTime}`);

    if (end <= start) {
      toast.error('Bitiş saati başlangıç saatinden sonra olmalıdır');
      return;
    }

    createReservationMutation.mutate();
  };

  const handleApprove = (reservation: any) => {
    if (!window.confirm('Bu rezervasyonu onaylamak istediğinize emin misiniz?')) return;
    approveReservationMutation.mutate(reservation.id.toString());
  };

  const handleReject = (reservation: any) => {
    const reason = window.prompt('Lütfen reddetme sebebini yazın:');
    if (!reason || !reason.trim()) return;
    rejectReservationMutation.mutate({ id: reservation.id.toString(), reason: reason.trim() });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Beklemede</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Onaylandı</Badge>;
      case 'REJECTED':
        return <Badge variant="error">Reddedildi</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Unique buildings
  const buildings = Array.from(new Set(classrooms.map((c: any) => c.building)));

  const isAdmin =
    user?.role?.toLowerCase() === 'admin' || user?.role === 'ADMIN';

  if (classroomsLoading) {
    return (
      <div className="classroom-reservations-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="classroom-reservations-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Sınıf Rezervasyonları' },
        ]}
      />
      <PageHeader
        title="Sınıf Rezervasyonları"
        description="Müsait sınıfları görüntüleyin ve rezervasyon yapın"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Bina:</label>
              <Select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                options={[
                  { value: '', label: 'Tüm Binalar' },
                  ...buildings.map((b: string) => ({ value: b, label: b })),
                ]}
              />
            </div>
            <div className="filter-group">
              <label>Minimum Kapasite:</label>
              <TextInput
                type="number"
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                placeholder="Kapasite"
                min="1"
              />
            </div>
            <div className="filter-group">
              <label>Tarih:</label>
              <TextInput
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Classrooms */}
      <Card>
        <CardHeader>
          <CardTitle>Müsait Sınıflar ({classrooms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {classrooms.length === 0 ? (
            <div className="empty-state">
              <p>Bu kriterlere uygun sınıf bulunamadı</p>
            </div>
          ) : (
            <div className="classrooms-grid">
              {classrooms.map((classroom: any) => (
                <Card key={classroom.id} className="classroom-card">
                  <CardHeader>
                    <CardTitle>{classroom.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="classroom-details">
                      <div className="detail-item">
                        <span className="detail-label">Bina:</span>
                        <span className="detail-value">{classroom.building}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Kapasite:</span>
                        <span className="detail-value">{classroom.capacity} kişi</span>
                      </div>
                      {classroom.floor && (
                        <div className="detail-item">
                          <span className="detail-label">Kat:</span>
                          <span className="detail-value">{classroom.floor}</span>
                        </div>
                      )}
                      {classroom.equipment && classroom.equipment.length > 0 && (
                        <div className="detail-item">
                          <span className="detail-label">Ekipman:</span>
                          <span className="detail-value">{classroom.equipment.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleReserve(classroom)}
                      fullWidth
                      style={{ marginTop: '16px' }}
                    >
                      Rezerve Et
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Reservations */}
      {reservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rezervasyonlarım</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="reservations-list">
              {reservations.map((reservation: any) => {
                const dateStr = reservation.date || reservation.reservationDate;
                const classroomName = reservation.classroomName || reservation.classroom?.name || 'Sınıf';

                return (
                  <div key={reservation.id} className="reservation-item">
                    <div className="reservation-info">
                      <div className="reservation-header">
                        <h4>{classroomName}</h4>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <div className="reservation-details">
                        {dateStr && (
                          <span>
                            📅 {format(parseISO(dateStr), 'd MMMM yyyy EEEE', { locale: tr })}
                          </span>
                        )}
                        {reservation.startTime && reservation.endTime && (
                          <span>
                            🕐 {reservation.startTime} - {reservation.endTime}
                          </span>
                        )}
                        {reservation.purpose && <span>📝 {reservation.purpose}</span>}
                        {reservation.rejectionReason && (
                          <span>❗ Reddetme Sebebi: {reservation.rejectionReason}</span>
                        )}
                      </div>
                    </div>

                    {isAdmin && reservation.status === 'PENDING' && (
                      <div className="reservation-actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleApprove(reservation)}
                          disabled={approveReservationMutation.isLoading || rejectReservationMutation.isLoading}
                        >
                          Onayla
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(reservation)}
                          disabled={approveReservationMutation.isLoading || rejectReservationMutation.isLoading}
                        >
                          Reddet
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reservation Modal */}
      <Modal
        isOpen={reservationModalOpen}
        onClose={() => {
          setReservationModalOpen(false);
          setSelectedClassroom(null);
          setReservationPurpose('');
        }}
        title="Sınıf Rezervasyonu"
        size="md"
      >
        {selectedClassroom && (
          <div className="reservation-modal-content">
            <div className="reservation-info">
              <p><strong>Sınıf:</strong> {selectedClassroom.name}</p>
              <p><strong>Bina:</strong> {selectedClassroom.building}</p>
              <p><strong>Kapasite:</strong> {selectedClassroom.capacity} kişi</p>
            </div>

            <div className="reservation-form">
              <div className="form-group">
                <label>Tarih *</label>
                <TextInput
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Başlangıç Saati *</label>
                  <TextInput
                    type="time"
                    value={reservationStartTime}
                    onChange={(e) => setReservationStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bitiş Saati *</label>
                  <TextInput
                    type="time"
                    value={reservationEndTime}
                    onChange={(e) => setReservationEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Amaç *</label>
                <TextInput
                  type="textarea"
                  value={reservationPurpose}
                  onChange={(e) => setReservationPurpose(e.target.value)}
                  placeholder="Rezervasyon amacınızı açıklayın..."
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setReservationModalOpen(false);
                  setSelectedClassroom(null);
                  setReservationPurpose('');
                }}
              >
                İptal
              </Button>
              <Button
                onClick={handleConfirmReservation}
                disabled={createReservationMutation.isLoading || !reservationPurpose.trim()}
              >
                {createReservationMutation.isLoading ? 'Rezerve Ediliyor...' : 'Rezerve Et'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

