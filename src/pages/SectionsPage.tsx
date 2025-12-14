import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { sectionService, type SectionListParams } from '@/services/api/section.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { Select } from '@/components/common/Select';
import './SectionsPage.css';

export const SectionsPage: React.FC = () => {
  const [semester, setSemester] = useState<string>('');
  const [year, setYear] = useState<string>('');

  const params: SectionListParams = {
    semester: semester || undefined,
    year: year ? parseInt(year) : undefined,
  };

  const { data, isLoading, error } = useQuery(
    ['sections', params],
    () => sectionService.getSections(params),
    {
      keepPreviousData: true,
    }
  );

  const sections = data?.data || [];

  if (isLoading) {
    return (
      <div className="sections-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sections-page">
        <div className="error-message">Section'lar yüklenirken bir hata oluştu</div>
      </div>
    );
  }

  return (
    <div className="sections-page">
      <div className="sections-header">
        <h1>Ders Bölümleri</h1>
        <Button onClick={() => toast.info('Section oluşturma özelliği yakında eklenecek')}>
          Yeni Section Ekle
        </Button>
      </div>

      {/* Filters */}
      <div className="sections-filters">
        <Select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          placeholder="Dönem seçin"
        >
          <option value="">Tüm Dönemler</option>
          <option value="FALL">Güz</option>
          <option value="SPRING">Bahar</option>
          <option value="SUMMER">Yaz</option>
        </Select>
        <TextInput
          type="number"
          placeholder="Yıl (örn: 2024)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        {(semester || year) && (
          <Button variant="secondary" onClick={() => { setSemester(''); setYear(''); }}>
            Temizle
          </Button>
        )}
      </div>

      {/* Sections List */}
      <div className="sections-grid">
        {sections.length === 0 ? (
          <div className="empty-state">Section bulunamadı</div>
        ) : (
          sections.map((section: any) => {
            const course = section.course || {};
            const instructor = section.instructor || {};

            return (
              <div key={section.id} className="section-card">
                <div className="section-card-header">
                  <div>
                    <h3 className="course-code">{course.code}</h3>
                    <h4 className="course-name">{course.name}</h4>
                  </div>
                  <span className="section-number">Bölüm {section.sectionNumber}</span>
                </div>

                <div className="section-details">
                  <div className="detail-item">
                    <span className="detail-label">Dönem:</span>
                    <span className="detail-value">
                      {section.semester === 'FALL' ? 'Güz' : 
                       section.semester === 'SPRING' ? 'Bahar' : 
                       section.semester === 'SUMMER' ? 'Yaz' : section.semester} {section.year}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Öğretim Üyesi:</span>
                    <span className="detail-value">
                      {instructor.name || 
                       `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() ||
                       'Belirtilmemiş'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Kapasite:</span>
                    <span className="detail-value">
                      {section.enrolledCount || 0} / {section.capacity || 0}
                    </span>
                  </div>
                </div>

                <div className="section-actions">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => toast.info('Section detayları yakında eklenecek')}
                  >
                    Detaylar
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

