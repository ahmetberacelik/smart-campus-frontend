import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
// useNavigate removed - not used
import { toast } from 'react-toastify';
import { scheduleService } from '@/services/api/schedule.service';
import { sectionService } from '@/services/api/section.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

export const GenerateSchedulePage: React.FC = () => {
  const { user } = useAuth();
  // navigate removed - not used
  const [semester, setSemester] = useState<string>(getCurrentSemesterAndYear().semester);
  const [year, setYear] = useState<number>(getCurrentSemesterAndYear().year);
  const [selectedSectionIds, setSelectedSectionIds] = useState<Set<string>>(new Set());
  const [generatedSchedules, setGeneratedSchedules] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');

  const { data: sectionsData, isLoading: sectionsLoading } = useQuery(
    ['sections-for-schedule', semester, year],
    () => sectionService.getSectionsBySemester(semester, year),
    {
      retry: 1,
      onError: (_err: any) => {
        toast.error('Ders bölümleri yüklenirken bir hata oluştu');
      },
    }
  );

  const sections = sectionsData?.data || [];

  const generateScheduleMutation = useMutation(
    () => scheduleService.generateSchedule({
      semester,
      year,
      sectionIds: Array.from(selectedSectionIds),
    }),
    {
      onSuccess: (response) => {
        setGeneratedSchedules(response.data || []);
        toast.success(`${response.data?.length || 0} alternatif program oluşturuldu`);
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Program oluşturulurken bir hata oluştu');
      },
    }
  );

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSectionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedSectionIds.size === sections.length) {
      setSelectedSectionIds(new Set());
    } else {
      setSelectedSectionIds(new Set(sections.map((s: any) => s.id.toString())));
    }
  };

  const handleGenerate = () => {
    if (selectedSectionIds.size === 0) {
      toast.error('Lütfen en az bir ders bölümü seçin');
      return;
    }
    generateScheduleMutation.mutate();
  };

  const handleSaveSchedule = () => {
    if (!selectedScheduleId) {
      toast.error('Lütfen bir program seçin');
      return;
    }
    toast.info('Program kaydetme özelliği backend ile entegre edilecek');
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
        title="Program Oluştur"
        description="Ders bölümleri için otomatik program oluşturun"
      />

      <div className="generate-schedule-container">
        {/* Semester/Year Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Dönem Seçimi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="form-group">
              <label>Dönem:</label>
              <Select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                options={[
                  { value: 'FALL', label: 'Güz (FALL)' },
                  { value: 'SPRING', label: 'Bahar (SPRING)' },
                  { value: 'SUMMER', label: 'Yaz (SUMMER)' },
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
          </CardContent>
        </Card>

        {/* Section Selection */}
        <Card>
          <CardHeader>
            <div className="section-header-actions">
              <CardTitle>Ders Bölümleri Seç ({selectedSectionIds.size} seçili)</CardTitle>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedSectionIds.size === sections.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sectionsLoading ? (
              <LoadingSpinner />
            ) : sections.length === 0 ? (
              <p className="no-sections">Bu dönem için ders bölümü bulunamadı</p>
            ) : (
              <div className="sections-list">
                {sections.map((section: any) => {
                  const course = section.course || {};
                  const isSelected = selectedSectionIds.has(section.id.toString());

                  return (
                    <div
                      key={section.id}
                      className={`section-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSectionToggle(section.id.toString())}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSectionToggle(section.id.toString())}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="section-info">
                        <div className="section-title">
                          {course.code} - {course.name} (Bölüm {section.sectionNumber})
                        </div>
                        <div className="section-details">
                          <span>Öğretim Üyesi: {section.instructorName || '-'}</span>
                          <span>Kapasite: {section.capacity || '-'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="generate-actions">
          <Button
            onClick={handleGenerate}
            disabled={selectedSectionIds.size === 0 || generateScheduleMutation.isLoading}
            size="lg"
            fullWidth
          >
            {generateScheduleMutation.isLoading ? 'Program Oluşturuluyor...' : 'Program Oluştur'}
          </Button>
        </div>

        {/* Generated Schedules */}
        {generatedSchedules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Oluşturulan Program Alternatifleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="schedules-list">
                {generatedSchedules.map((schedule: any, index: number) => (
                  <div
                    key={schedule.id}
                    className={`schedule-item ${selectedScheduleId === schedule.id ? 'selected' : ''}`}
                    onClick={() => setSelectedScheduleId(schedule.id)}
                  >
                    <div className="schedule-header">
                      <h4>Alternatif {index + 1}</h4>
                      <div className="schedule-badges">
                        <Badge variant={schedule.conflicts === 0 ? 'success' : 'warning'}>
                          {schedule.conflicts} Çakışma
                        </Badge>
                        <Badge variant="primary">Skor: {schedule.score?.toFixed(2) || '-'}</Badge>
                      </div>
                    </div>
                    <div className="schedule-details">
                      <p>Toplam {schedule.entries?.length || 0} ders programlandı</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedScheduleId && (
                <div className="save-actions">
                  <Button
                    onClick={handleSaveSchedule}
                    size="lg"
                  >
                    Seçili Programı Kaydet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

