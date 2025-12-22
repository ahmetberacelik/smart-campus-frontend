import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { eventService } from '@/services/api/event.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { Select } from '@/components/common/Select';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { EventCard, type EventCardData } from '@/components/events/EventCard';
import './EventsPage.css';

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState(0);

  const { data: eventsData, isLoading, error: eventsError } = useQuery(
    ['events', page, search, category],
    () => eventService.getEvents({
      page,
      limit: 20,
      search: search || undefined,
      category: category || undefined,
      upcoming: true,
    }),
    {
      retry: 1,
      onError: (err: any) => {
        console.error('Events fetch error:', err);
      },
    }
  );

  const pageData = eventsData?.data;
  const events = (pageData?.content || pageData || []) as EventCardData[];
  const totalPages = pageData?.totalPages || 0;

  const categories = [
    { value: '', label: 'Tüm Kategoriler' },
    { value: 'CONFERENCE', label: 'Konferans' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'SOCIAL', label: 'Sosyal' },
    { value: 'SPORTS', label: 'Spor' },
  ];

  const handleViewDetails = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleRegister = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="events-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (eventsError) {
    const errorData = eventsError as any;
    const statusCode = errorData?.response?.status || errorData?.status;
    
    return (
      <div className="events-page">
        <Breadcrumb
          items={[
            { label: 'Ana Sayfa', to: '/dashboard' },
            { label: 'Etkinlikler' },
          ]}
        />
        <PageHeader
          title="Etkinlikler"
          description="Yaklaşan etkinlikleri görüntüleyin ve kayıt olun"
        />
        <div className="error-message" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Etkinlikler yüklenirken bir hata oluştu</h3>
          <p>{errorData?.response?.data?.message || errorData?.message || 'Lütfen daha sonra tekrar deneyin'}</p>
          {statusCode === 401 && (
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
              Oturumunuzun süresi dolmuş olabilir. Lütfen sayfayı yenileyin.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Etkinlikler' },
        ]}
      />
      <PageHeader
        title="Etkinlikler"
        description="Yaklaşan etkinlikleri görüntüleyin ve kayıt olun"
      />

      {/* Filters */}
      <div className="events-filters">
        <TextInput
          type="text"
          placeholder="Etkinlik adı ile ara..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          style={{ flex: 1, minWidth: '250px' }}
        />
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
          options={categories}
          style={{ minWidth: '200px' }}
        />
        {(search || category) && (
          <Button
            variant="secondary"
            onClick={() => {
              setSearch('');
              setCategory('');
              setPage(0);
            }}
          >
            Temizle
          </Button>
        )}
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor" />
          </svg>
          <h3>Etkinlik bulunamadı</h3>
          <p>Arama kriterlerinizi değiştirmeyi deneyin</p>
        </div>
      ) : (
        <>
          <div className="events-grid">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={handleViewDetails}
                onRegister={handleRegister}
                showRegisterButton={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Önceki
              </Button>
              <span>
                Sayfa {page + 1} / {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Sonraki
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

