import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { scheduleService, CreateScheduleRequest, ScheduleResponse } from '@/services/api/schedule.service';
import { sectionService } from '@/services/api/section.service';
import { classroomService, Classroom } from '@/services/api/classroom.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import './GenerateSchedulePage.css';

// Mevcut semester ve year'ı hesapla
const getCurrentSemesterAndYear = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  let semester: string;
  let academicYear: number;

  if (month >= 9 || month === 1) {
    semester = 'FALL';
    academicYear = month === 1 ? year - 1 : year;
  } else if (month >= 2 && month <= 6) {
    semester = 'SPRING';
    academicYear = year;
  } else {
    semester = 'SPRING';
    academicYear = year;
  }

  return { semester, year: academicYear };
};

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Pazartesi' },
  { value: 'TUESDAY', label: 'Salı' },
  { value: 'WEDNESDAY', label: 'Çarşamba' },
  { value: 'THURSDAY', label: 'Perşembe' },
  { value: 'FRIDAY', label: 'Cuma' },
  { value: 'SATURDAY', label: 'Cumartesi' },
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

export const GenerateSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [semester, setSemester] = useState<string>(getCurrentSemesterAndYear().semester);
  const [year, setYear] = useState<number>(getCurrentSemesterAndYear().year);

  // Seçilen ders bölümü
  const [selectedSection, setSelectedSection] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:30',
    classroomId: 0,
  });

  // Düzenleme modu
  const [editingSchedule, setEditingSchedule] = useState<ScheduleResponse | null>(null);

  // Ders bölümlerini getir
  const { data: sectionsData, isLoading: sectionsLoading } = useQuery(
    ['sections-for-schedule', semester, year],
    () => sectionService.getSectionsBySemester(semester, year),
    { retry: 1 }
  );

  // Derslikleri getir (min capacity 1 ile hepsini al)
  const { data: classroomsData, isLoading: classroomsLoading } = useQuery(
    'classrooms',
    () => classroomService.getClassroomsByCapacity(1),
    { retry: 1 }
  );

  // Mevcut programları getir
  const { data: schedulesData, isLoading: schedulesLoading } = useQuery(
    'all-schedules',
    () => scheduleService.getAllSchedules(),
    { retry: 1 }
  );

  const sections = sectionsData?.data || [];
  // classroomsData.data doğrudan array olmalı (getClassroomsByCapacity)
  const classrooms: Classroom[] = Array.isArray(classroomsData?.data) ? classroomsData.data : [];
  // schedulesData.data doğrudan array olmalı
  const schedules: ScheduleResponse[] = Array.isArray(schedulesData?.data) ? schedulesData.data : [];

  // Program oluştur mutation
  const createScheduleMutation = useMutation(
    (data: CreateScheduleRequest) => scheduleService.createSchedule(data),
    {
      onSuccess: () => {
        toast.success('Program başarıyla oluşturuldu');
        queryClient.invalidateQueries('all-schedules');
        setSelectedSection(null);
        setFormData({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:30', classroomId: 0 });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Program oluşturulurken hata oluştu');
      },
    }
  );

  // Program güncelle mutation
  const updateScheduleMutation = useMutation(
    ({ id, data }: { id: number; data: CreateScheduleRequest }) =>
      scheduleService.updateSchedule(id, data),
    {
      onSuccess: () => {
        toast.success('Program başarıyla güncellendi');
        queryClient.invalidateQueries('all-schedules');
        setEditingSchedule(null);
        setSelectedSection(null);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Program güncellenirken hata oluştu');
      },
    }
  );

  // Program sil mutation
  const deleteScheduleMutation = useMutation(
    (id: number) => scheduleService.deleteSchedule(id),
    {
      onSuccess: () => {
        toast.success('Program silindi');
        queryClient.invalidateQueries('all-schedules');
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Program silinirken hata oluştu');
      },
    }
  );

  const handleSectionSelect = (section: any) => {
    setSelectedSection(section);
    setEditingSchedule(null);
    setFormData({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:30', classroomId: 0 });
  };

  const handleEditSchedule = (schedule: ScheduleResponse) => {
    setEditingSchedule(schedule);
    setSelectedSection(sections.find((s: any) => s.id === schedule.sectionId) || null);
    setFormData({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime.substring(0, 5), // HH:mm:ss -> HH:mm
      endTime: schedule.endTime.substring(0, 5),
      classroomId: schedule.classroomId,
    });
  };

  const handleSubmit = async () => {
    if (!selectedSection) {
      toast.error('Lütfen bir ders bölümü seçin');
      return;
    }
    if (!formData.classroomId) {
      toast.error('Lütfen bir derslik seçin');
      return;
    }

    const requestData: CreateScheduleRequest = {
      sectionId: selectedSection.id,
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      classroomId: formData.classroomId,
    };

    if (editingSchedule) {
      updateScheduleMutation.mutate({ id: editingSchedule.id, data: requestData });
    } else {
      createScheduleMutation.mutate(requestData);
    }
  };

  const handleDelete = (scheduleId: number) => {
    if (window.confirm('Bu programı silmek istediğinize emin misiniz?')) {
      deleteScheduleMutation.mutate(scheduleId);
    }
  };

  const getDayLabel = (day: string) => {
    return DAYS_OF_WEEK.find(d => d.value === day)?.label || day;
  };

  const getClassroomName = (classroomId: number) => {
    const classroom = classrooms.find(c => c.id === classroomId);
    return classroom ? `${classroom.building} ${classroom.roomNumber}` : '-';
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="generate-schedule-page">
        <div className="error-message">
          <h3>Yetki Gerekli</h3>
          <p>Bu sayfaya erişim için admin yetkisi gereklidir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="generate-schedule-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Program Oluştur' },
        ]}
      />
      <PageHeader
        title="Ders Programı Yönetimi"
        description="Ders bölümleri için manuel program atayın"
      />

      <div className="schedule-management-grid">
        {/* Sol Panel: Dönem Seçimi ve Bölüm Listesi */}
        <div className="left-panel">
          {/* Dönem Seçimi */}
          <Card>
            <CardHeader>
              <CardTitle>Dönem Seçimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="form-row">
                <div className="form-group">
                  <label>Dönem:</label>
                  <Select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    options={[
                      { value: 'FALL', label: 'Güz' },
                      { value: 'SPRING', label: 'Bahar' },
                      { value: 'SUMMER', label: 'Yaz' },
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label>Yıl:</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="year-input"
                    min="2020"
                    max="2030"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ders Bölümleri Listesi */}
          <Card>
            <CardHeader>
              <CardTitle>Ders Bölümleri ({sections.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {sectionsLoading ? (
                <LoadingSpinner />
              ) : sections.length === 0 ? (
                <p className="no-data">Bu dönem için ders bölümü bulunamadı</p>
              ) : (
                <div className="sections-list">
                  {sections.map((section: any) => {
                    const isSelected = selectedSection?.id === section.id;
                    const hasSchedule = schedules.some(s => s.sectionId === section.id);

                    return (
                      <div
                        key={section.id}
                        className={`section-item ${isSelected ? 'selected' : ''} ${hasSchedule ? 'has-schedule' : ''}`}
                        onClick={() => handleSectionSelect(section)}
                      >
                        <div className="section-main">
                          <span className="course-code">{section.courseCode || section.course?.code}</span>
                          <span className="course-name">{section.courseName || section.course?.name}</span>
                        </div>
                        <div className="section-meta">
                          <span>Bölüm {section.sectionNumber}</span>
                          <span>{section.instructorName || '-'}</span>
                          {hasSchedule && <span className="badge-scheduled">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sağ Panel: Form ve Mevcut Programlar */}
        <div className="right-panel">
          {/* Program Atama Formu */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingSchedule ? 'Programı Düzenle' : 'Program Ata'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSection ? (
                <div className="schedule-form">
                  <div className="selected-section-info">
                    <strong>{selectedSection.courseCode || selectedSection.course?.code}</strong>
                    {' - '}
                    {selectedSection.courseName || selectedSection.course?.name}
                    {' (Bölüm '}
                    {selectedSection.sectionNumber}
                    {')'}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Gün:</label>
                      <Select
                        value={formData.dayOfWeek}
                        onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                        options={DAYS_OF_WEEK}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Başlangıç:</label>
                      <Select
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        options={TIME_SLOTS.map(t => ({ value: t, label: t }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Bitiş:</label>
                      <Select
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        options={TIME_SLOTS.map(t => ({ value: t, label: t }))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group full-width">
                      <label>Derslik:</label>
                      {classroomsLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <Select
                          value={formData.classroomId.toString()}
                          onChange={(e) => setFormData({ ...formData, classroomId: parseInt(e.target.value) })}
                          options={[
                            { value: '0', label: 'Seçiniz...' },
                            ...classrooms.map(c => ({
                              value: c.id.toString(),
                              label: `${c.building} ${c.roomNumber} (${c.capacity} kişi)`
                            }))
                          ]}
                        />
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <Button
                      onClick={handleSubmit}
                      disabled={createScheduleMutation.isLoading || updateScheduleMutation.isLoading}
                    >
                      {createScheduleMutation.isLoading || updateScheduleMutation.isLoading
                        ? 'Kaydediliyor...'
                        : editingSchedule ? 'Güncelle' : 'Program Ata'}
                    </Button>
                    {editingSchedule && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingSchedule(null);
                          setSelectedSection(null);
                        }}
                      >
                        İptal
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="no-selection">Sol listeden bir ders bölümü seçin</p>
              )}
            </CardContent>
          </Card>

          {/* Mevcut Programlar Tablosu */}
          <Card>
            <CardHeader>
              <CardTitle>Mevcut Programlar ({schedules.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <LoadingSpinner />
              ) : schedules.length === 0 ? (
                <p className="no-data">Henüz oluşturulmuş program yok</p>
              ) : (
                <div className="schedules-table-container">
                  <table className="schedules-table">
                    <thead>
                      <tr>
                        <th>Ders</th>
                        <th>Gün</th>
                        <th>Saat</th>
                        <th>Derslik</th>
                        <th>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td>
                            <strong>{schedule.courseCode}</strong>
                            <br />
                            <small>{schedule.courseName}</small>
                          </td>
                          <td>{getDayLabel(schedule.dayOfWeek)}</td>
                          <td>{schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}</td>
                          <td>{schedule.classroomName || getClassroomName(schedule.classroomId)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="edit-btn"
                                onClick={() => handleEditSchedule(schedule)}
                                title="Düzenle"
                              >
                                ✏️
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDelete(schedule.id)}
                                title="Sil"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
