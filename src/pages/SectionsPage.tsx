import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { sectionService } from '@/services/api/section.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { Select } from '@/components/common/Select';
import './SectionsPage.css';

export const SectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [semester, setSemester] = useState<string>('FALL'); // Varsayılan olarak FALL seçili
  const [year, setYear] = useState<string>('2024'); // Varsayılan yıl (mevcut yılı otomatik hesaplayabiliriz)

  // Kullanıcının bölüm ID'sini al
  const userDepartmentId = user?.facultyInfo?.departmentId?.toString() || user?.studentInfo?.departmentId?.toString();

  // Eğer semester ve year seçiliyse, /sections/semester/list endpoint'ini kullan
  // Aksi halde hata verecek çünkü /sections endpoint'i çalışmıyor
  const { data, isLoading, error } = useQuery(
    ['sections', semester, year],
    () => {
      if (semester && year) {
        return sectionService.getSectionsBySemester(semester, parseInt(year));
      } else {
        // Eğer semester/year yoksa boş array dön
        return Promise.resolve({ success: true, data: [] });
      }
    },
    {
      enabled: !!semester && !!year, // Sadece semester ve year varsa çalış
      keepPreviousData: true,
      onError: (error: any) => {
        console.error('Sections yüklenirken hata:', error);
        toast.error(error?.response?.data?.message || 'Ders bölümleri yüklenirken bir hata oluştu');
      },
    }
  );

  const allSections = data?.data || [];

  // Kullanıcının bölümüne ait section'ları filtrele
  const sections = useMemo(() => {
    if (!userDepartmentId) {
      return allSections; // Bölüm ID yoksa tümünü göster
    }

    return allSections.filter((section: any) => {
      const courseDepartmentId = section.courseDepartmentId?.toString() || 
                                  section.course?.departmentId?.toString();
      return courseDepartmentId === userDepartmentId;
    });
  }, [allSections, userDepartmentId]);

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
          placeholder="Dönem seçin (Zorunlu)"
          options={[
            { value: 'FALL', label: 'Güz (FALL)' },
            { value: 'SPRING', label: 'Bahar (SPRING)' },
            { value: 'SUMMER', label: 'Yaz (SUMMER)' },
          ]}
        />
        <TextInput
          type="number"
          placeholder="Yıl (örn: 2024) *"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        {(semester || year) && (
          <Button variant="secondary" onClick={() => { setSemester('FALL'); setYear('2024'); }}>
            Varsayılan
          </Button>
        )}
      </div>
      {(!semester || !year) && (
        <div style={{ padding: '16px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', marginBottom: '16px' }}>
          ⚠️ Ders bölümlerini görmek için lütfen dönem ve yıl seçin.
        </div>
      )}

      {/* Sections List */}
      <div className="sections-grid">
        {sections.length === 0 ? (
          <div className="empty-state">Section bulunamadı</div>
        ) : (
          sections.map((section: any) => {
            const course = section.course || {};
            const instructor = section.instructor || {};

            // Backend'den course bilgileri direkt olarak da gelebilir
            const courseCode = section.courseCode || course.code || '';
            const courseName = section.courseName || course.name || '';
            const instructorName = section.instructorName || 
                                  instructor.name || 
                                  `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() ||
                                  'Belirtilmemiş';
            const courseDepartmentName = section.courseDepartmentName || course.departmentName || '';

            return (
              <div key={section.id} className="section-card">
                <div className="section-card-header">
                  <div>
                    <h3 className="course-code">{courseCode}</h3>
                    <h4 className="course-name">{courseName}</h4>
                    {courseDepartmentName && (
                      <span className="course-department" style={{ fontSize: '0.85em', color: '#666' }}>
                        {courseDepartmentName}
                      </span>
                    )}
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
                    <span className="detail-value">{instructorName}</span>
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

