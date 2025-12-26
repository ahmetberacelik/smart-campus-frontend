import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { eventService } from '@/services/api/event.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import './EventDetailPage.css';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  const { data: eventData, isLoading } = useQuery(
    ['event', id],
    () => eventService.getEventById(id!),
    {
      enabled: !!id,
      retry: 1,
      onError: () => {
        toast.error('Etkinlik bilgileri yüklenirken bir hata oluştu');
      },
    }
  );

  const registerMutation = useMutation(
    () => eventService.registerEvent({
      eventId: id!,
      customFieldResponses: Object.keys(customFields).length > 0 ? customFields : undefined,
    }),
    {
      onSuccess: () => {
        toast.success('Etkinliğe başarıyla kayıt oldunuz');
        setRegisterModalOpen(false);
        setCustomFields({});
        queryClient.invalidateQueries(['event', id]);
        queryClient.invalidateQueries('my-events');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Kayıt olurken bir hata oluştu');
      },
    }
  );

  const event = eventData?.data;
  const isStudent = user?.role?.toLowerCase() === 'student' || user?.role === 'STUDENT';
  const eventDate = event?.date ? parseISO(event.date) : null;
  const isPast = eventDate ? eventDate < new Date() : false;
  const isRegistrationDeadlinePassed = event?.registrationDeadline
    ? parseISO(event.registrationDeadline) < new Date()
    : false;
  const remainingSpots = event?.capacity && event?.registeredCount
    ? event.capacity - event.registeredCount
    : null;
  const canRegister = isStudent && !isPast && !isRegistrationDeadlinePassed && remainingSpots !== 0;

  const getCategoryLabel = (category?: string): string => {
    switch (category?.toUpperCase()) {
      case 'CONFERENCE':
        return 'Konferans';
      case 'WORKSHOP':
        return 'Workshop';
      case 'SOCIAL':
        return 'Sosyal';
      case 'SPORTS':
        return 'Spor';
      default:
        return category || 'Etkinlik';
    }
  };

  const handleRegister = () => {
    setRegisterModalOpen(true);
  };

  const handleConfirmRegister = () => {
    registerMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="event-detail-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail-page">
        <div className="error-message">
          <h3>Etkinlik bulunamadı</h3>
          <Button onClick={() => navigate('/events')}>Etkinliklere Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Etkinlikler', to: '/events' },
          { label: event.title },
        ]}
      />
      <PageHeader
        title={event.title}
        description={event.description}
      />

      <div className="event-detail-grid">
        {/* Event Info */}
        <Card className="event-info-card">
          <CardContent>
            <div className="event-details">
              <div className="detail-section">
                <h3>Etkinlik Bilgileri</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">📅 Tarih:</span>
                    <span className="detail-value">
                      {eventDate ? format(eventDate, 'd MMMM yyyy EEEE', { locale: tr }) : '-'}
                    </span>
                  </div>
                  {event.startTime && (
                    <div className="detail-item">
                      <span className="detail-label">🕐 Saat:</span>
                      <span className="detail-value">
                        {event.startTime}
                        {event.endTime && ` - ${event.endTime}`}
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">📍 Konum:</span>
                    <span className="detail-value">{event.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">🏷️ Kategori:</span>
                    <span className="detail-value">
                      <Badge variant="primary">{getCategoryLabel(event.category)}</Badge>
                    </span>
                  </div>
                  {event.price !== undefined && event.price > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">💰 Ücret:</span>
                      <span className="detail-value">{event.price.toFixed(2)}₺</span>
                    </div>
                  )}
                  {remainingSpots !== null && (
                    <div className="detail-item">
                      <span className="detail-label">👥 Kalan Yer:</span>
                      <span className="detail-value">{remainingSpots > 0 ? `${remainingSpots} kişi` : 'Dolu'}</span>
                    </div>
                  )}
                  {event.registrationDeadline && (
                    <div className="detail-item">
                      <span className="detail-label">⏰ Son Kayıt:</span>
                      <span className="detail-value">
                        {format(parseISO(event.registrationDeadline), 'd MMMM yyyy', { locale: tr })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {event.description && (
                <div className="detail-section">
                  <h3>Açıklama</h3>
                  <p className="event-description">{event.description}</p>
                </div>
              )}
            </div>

            {canRegister && (
              <div className="event-actions">
                <Button
                  onClick={handleRegister}
                  disabled={registerMutation.isLoading}
                  size="lg"
                  fullWidth
                >
                  {registerMutation.isLoading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Image */}
        {event.imageUrl && (
          <Card className="event-image-card">
            <CardContent>
              <img src={event.imageUrl} alt={event.title} className="event-image" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Registration Modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => {
          setRegisterModalOpen(false);
          setCustomFields({});
        }}
        title="Etkinliğe Kayıt Ol"
        size="md"
      >
        <div className="registration-modal-content">
          {event.customFields && event.customFields.length > 0 ? (
            <>
              <p>Lütfen aşağıdaki bilgileri doldurun:</p>
              <div className="custom-fields">
                {event.customFields.map((field: any) => (
                  <div key={field.id} className="custom-field">
                    <label>
                      {field.label} {field.required && <span style={{ color: '#f44336' }}>*</span>}
                    </label>
                    {field.type === 'TEXT' || field.type === 'EMAIL' ? (
                      <TextInput
                        type={field.type === 'EMAIL' ? 'email' : 'text'}
                        value={customFields[field.id] || ''}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        required={field.required}
                      />
                    ) : field.type === 'NUMBER' ? (
                      <TextInput
                        type="number"
                        value={customFields[field.id] || ''}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        required={field.required}
                      />
                    ) : field.type === 'SELECT' && field.options ? (
                      <select
                        value={customFields[field.id] || ''}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        required={field.required}
                        className="custom-select"
                      >
                        <option value="">Seçin...</option>
                        {field.options.map((option: string) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>Bu etkinliğe kayıt olmak istediğinize emin misiniz?</p>
          )}
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setRegisterModalOpen(false);
                setCustomFields({});
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleConfirmRegister}
              disabled={registerMutation.isLoading}
            >
              {registerMutation.isLoading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

