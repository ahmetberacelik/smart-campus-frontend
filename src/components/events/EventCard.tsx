import React from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/common/Button';
import './EventCard.css';

export interface EventCardData {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  category?: string;
  capacity?: number;
  registeredCount?: number;
  price?: number;
  registrationDeadline?: string;
  imageUrl?: string;
}

interface EventCardProps {
  event: EventCardData;
  onViewDetails?: (eventId: string) => void;
  onRegister?: (eventId: string) => void;
  showRegisterButton?: boolean;
  className?: string;
}

/**
 * Event card component
 * Etkinlik kartı, kategori badge'i, kapasite bilgisi
 */
export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onRegister,
  showRegisterButton = true,
  className = '',
}) => {
  const eventDate = parseISO(event.date);
  const isPast = eventDate < new Date();
  const isRegistrationDeadlinePassed = event.registrationDeadline
    ? parseISO(event.registrationDeadline) < new Date()
    : false;

  const remainingSpots = event.capacity && event.registeredCount
    ? event.capacity - event.registeredCount
    : null;

  const getCategoryColor = (category?: string): string => {
    switch (category?.toLowerCase()) {
      case 'conference':
        return 'primary';
      case 'workshop':
        return 'success';
      case 'social':
        return 'warning';
      case 'sports':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category?: string): string => {
    switch (category?.toLowerCase()) {
      case 'conference':
        return 'Konferans';
      case 'workshop':
        return 'Workshop';
      case 'social':
        return 'Sosyal';
      case 'sports':
        return 'Spor';
      default:
        return category || 'Etkinlik';
    }
  };

  return (
    <Card className={`event-card ${className} ${isPast ? 'past-event' : ''}`}>
      {event.imageUrl && (
        <div className="event-image">
          <img src={event.imageUrl} alt={event.title} />
        </div>
      )}
      <CardHeader>
        <div className="event-card-header">
          <CardTitle className="event-title">{event.title}</CardTitle>
          {event.category && (
            <Badge variant={getCategoryColor(event.category) as any}>
              {getCategoryLabel(event.category)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {event.description && (
          <p className="event-description">
            {event.description.length > 150
              ? `${event.description.substring(0, 150)}...`
              : event.description}
          </p>
        )}

        <div className="event-details">
          <div className="event-detail-item">
            <span className="detail-icon">📅</span>
            <span className="detail-text">
              {format(eventDate, 'd MMMM yyyy EEEE', { locale: tr })}
              {event.startTime && ` • ${event.startTime}`}
              {event.endTime && ` - ${event.endTime}`}
            </span>
          </div>

          {event.location && (
            <div className="event-detail-item">
              <span className="detail-icon">📍</span>
              <span className="detail-text">{event.location}</span>
            </div>
          )}

          {event.price !== undefined && event.price > 0 && (
            <div className="event-detail-item">
              <span className="detail-icon">💰</span>
              <span className="detail-text">{event.price.toFixed(2)}₺</span>
            </div>
          )}

          {remainingSpots !== null && (
            <div className="event-detail-item">
              <span className="detail-icon">👥</span>
              <span className="detail-text">
                {remainingSpots > 0 ? `${remainingSpots} kalan yer` : 'Dolu'}
              </span>
            </div>
          )}

          {event.registrationDeadline && (
            <div className="event-detail-item">
              <span className="detail-icon">⏰</span>
              <span className="detail-text">
                Son kayıt: {format(parseISO(event.registrationDeadline), 'd MMM yyyy', { locale: tr })}
              </span>
            </div>
          )}
        </div>

        <div className="event-actions">
          {onViewDetails && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewDetails(event.id)}
            >
              Detaylar
            </Button>
          )}
          {showRegisterButton && onRegister && !isPast && !isRegistrationDeadlinePassed && remainingSpots !== 0 && (
            <Button
              size="sm"
              onClick={() => onRegister(event.id)}
              disabled={remainingSpots === 0}
            >
              {remainingSpots === 0 ? 'Dolu' : 'Kayıt Ol'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

