import React, { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/common/Button';
import './WeeklyCalendar.css';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  date?: string; // ISO date string (yyyy-MM-dd)
  color?: string; // Hex color
  location?: string;
  type?: string; // 'course', 'event', etc.
}

interface WeeklyCalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
}

/**
 * Weekly calendar component
 * Haftalık görünüm, renk kodlu etkinlikler
 */
export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  events,
  onDateClick,
  onEventClick,
  weekStartsOn = 1, // Monday
  className = '',
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Events grouped by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    // Initialize all week days
    weekDays.forEach((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      grouped[dateKey] = [];
    });

    events.forEach(event => {
      if (event.date) {
        const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
      }
    });
    return grouped;
  }, [events, weekDays]);

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  return (
    <div className={`weekly-calendar ${className}`}>
      <div className="calendar-header">
        <div className="calendar-nav">
          <Button variant="secondary" size="sm" onClick={goToPreviousWeek}>
            ← Önceki Hafta
          </Button>
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Bugün
          </Button>
          <Button variant="secondary" size="sm" onClick={goToNextWeek}>
            Sonraki Hafta →
          </Button>
        </div>
        <div className="calendar-week-label">
          {format(weekStart, 'd MMM', { locale: tr })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: tr })}
        </div>
      </div>

      <div className="calendar-grid">
        {/* Day headers */}
        <div className="calendar-day-header">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`day-header ${isToday(day) ? 'today' : ''}`}
            >
              <div className="day-name">{format(day, 'EEE', { locale: tr })}</div>
              <div className="day-number">{format(day, 'd')}</div>
            </div>
          ))}
        </div>

        {/* Day columns with events */}
        <div className="calendar-days">
          {weekDays.map((day, dayIndex) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[dateKey] || [];
            const isCurrentDay = isToday(day);

            return (
              <div
                key={dayIndex}
                className={`calendar-day ${isCurrentDay ? 'today' : ''}`}
                onClick={() => onDateClick?.(day)}
              >
                {dayEvents
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((event) => (
                    <div
                      key={event.id}
                      className="calendar-event"
                      style={{
                        backgroundColor: event.color || '#2196F3',
                        borderLeftColor: event.color || '#2196F3',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      title={`${event.title} - ${event.startTime} - ${event.endTime}${event.location ? ` - ${event.location}` : ''}`}
                    >
                      <div className="event-time">{event.startTime}</div>
                      <div className="event-title">{event.title}</div>
                      {event.location && (
                        <div className="event-location">📍 {event.location}</div>
                      )}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

