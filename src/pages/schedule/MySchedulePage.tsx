import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { scheduleService } from '@/services/api/schedule.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent } from '@/components/ui/Card';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';
import type { CalendarEvent } from '@/components/calendar/WeeklyCalendar';
import './MySchedulePage.css';

export const MySchedulePage: React.FC = () => {
  const { data: scheduleData, isLoading } = useQuery(
    'my-schedule',
    () => scheduleService.getMySchedule(),
    {
      retry: 1,
      onError: (err: any) => {
        toast.error('Ders programı yüklenirken bir hata oluştu');
      },
    }
  );

  const schedule = scheduleData?.data;

  // Demo amaçlı örnek ders programı (backend my-schedule endpoint'i hazır değilken gösterilir)
  const demoEvents: CalendarEvent[] = [
    {
      id: 'demo-1',
      title: 'CSE101 - Introduction to Computer Science',
      startTime: '09:00',
      endTime: '10:30',
      date: undefined, // WeeklyCalendar mevcut haftaya göre dağıtıyor
      location: 'Mühendislik Binası 101',
      type: 'course',
      color: '#2196F3',
    },
    {
      id: 'demo-2',
      title: 'MATH101 - Calculus I',
      startTime: '11:00',
      endTime: '12:30',
      date: undefined,
      location: 'Fen Binası 201',
      type: 'course',
      color: '#4CAF50',
    },
    {
      id: 'demo-3',
      title: 'PHYS101 - Physics I',
      startTime: '14:00',
      endTime: '15:30',
      date: undefined,
      location: 'Merkez Derslik 3',
      type: 'course',
      color: '#FF9800',
    },
  ];

  // Convert schedule entries to calendar events
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    if (!schedule?.entries) return [];

    // Map schedule entries to calendar events
    const events: CalendarEvent[] = [];
    
    schedule.entries.forEach((entry: any) => {
      // Find the date for this week's dayOfWeek
      const today = new Date();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
      
      const eventDate = new Date(currentWeekStart);
      eventDate.setDate(currentWeekStart.getDate() + (entry.dayOfWeek - 1));

      events.push({
        id: entry.id,
        title: `${entry.courseCode} - ${entry.courseName}`,
        startTime: entry.startTime,
        endTime: entry.endTime,
        date: eventDate.toISOString().split('T')[0],
        location: `${entry.building} ${entry.room}`,
        type: 'course',
        color: getCourseColor(entry.courseCode),
      });
    });

    return events;
  }, [schedule]);

  const handleExportICal = async () => {
    try {
      const blob = await scheduleService.getMyScheduleICal();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-schedule.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('iCal dosyası indirildi');
    } catch (error: any) {
      toast.error('iCal dosyası indirilirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="my-schedule-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="my-schedule-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Ders Programım' },
        ]}
      />
      <PageHeader
        title="Ders Programım"
        description={`${schedule?.semester || ''} ${schedule?.year || ''} dönemi ders programınız`}
        actions={
          <Button
            variant="secondary"
            onClick={handleExportICal}
            disabled={!schedule || calendarEvents.length === 0}
          >
            📅 iCal'e Aktar
          </Button>
        }
      />

      {!schedule || calendarEvents.length === 0 ? (
        <>
          <Card>
            <CardContent>
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor" />
                </svg>
                <h3>Henüz ders programınız bulunmuyor</h3>
                <p>Derslere kayıt olduktan sonra ders programınız burada görünecektir</p>
              </div>
            </CardContent>
          </Card>

          {/* Demo ders programı */}
          <Card style={{ marginTop: '24px' }}>
            <CardContent>
              <h3 style={{ marginBottom: '16px' }}>Örnek Ders Programı (Demo)</h3>
              <WeeklyCalendar
                events={demoEvents}
                onEventClick={(event) => {
                  toast.info(`${event.title} (örnek ders)`);
                }}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent>
            <WeeklyCalendar
              events={calendarEvents}
              onEventClick={(event) => {
                // Course detail'e yönlendir veya modal göster
                toast.info(`${event.title} ders detayları`);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

