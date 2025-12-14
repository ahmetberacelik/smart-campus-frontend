import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { courseService, type CourseListParams } from '@/services/api/course.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { Select } from '@/components/common/Select';
import { useAuth } from '@/context/AuthContext';
import './CoursesPage.css';

export const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const params: CourseListParams = {
    page,
    limit: 20,
    search: search || undefined,
    departmentId: departmentId || undefined,
    sortBy: 'name',
    direction: 'ASC',
  };

  const { data, isLoading, error, refetch } = useQuery(
    ['courses', params],
    () => courseService.getCourses(params),
    {
      keepPreviousData: true,
      retry: 1,
      onError: (err: any) => {
        console.error('Courses fetch error:', err);
        toast.error(err?.message || 'Dersler yüklenirken bir hata oluştu');
      },
    }
  );

  // Spring Page response format: { content: [], totalElements: 10, totalPages: 1, ... }
  const pageData = data?.data;
  const courses = pageData?.content || pageData || [];
  const totalPages = pageData?.totalPages || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    refetch();
  };

  const handleCourseClick = async (courseId: string) => {
    try {
      const response = await courseService.getCourseById(courseId);
      if (response.success && response.data) {
        setSelectedCourse(response.data);
      }
    } catch (error: any) {
      toast.error('Ders detayları yüklenirken bir hata oluştu');
    }
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role === 'ADMIN';

  if (isLoading) {
    return (
      <div className="courses-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.message || 'Dersler yüklenirken bir hata oluştu';
    return (
      <div className="courses-page">
        <div className="error-message">
          <h3>Hata Oluştu</h3>
          <p>{errorMessage}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Backend'in çalıştığından emin olun: http://localhost:8081/actuator/health
          </p>
          <Button onClick={() => refetch()} style={{ marginTop: '1rem' }}>
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Dersler</h1>
        {isAdmin && (
          <Button onClick={() => toast.info('Ders oluşturma özelliği yakında eklenecek')}>
            Yeni Ders Ekle
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <form onSubmit={handleSearch} className="courses-filters">
        <TextInput
          type="text"
          placeholder="Ders kodu veya adı ile ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit">Ara</Button>
        {search && (
          <Button variant="secondary" onClick={() => { setSearch(''); setPage(0); }}>
            Temizle
          </Button>
        )}
      </form>

      {/* Course List */}
      <div className="courses-grid">
        {courses.length === 0 ? (
          <div className="empty-state">Ders bulunamadı</div>
        ) : (
          courses.map((course: any) => (
            <div
              key={course.id}
              className="course-card"
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="course-card-header">
                <h3>{course.code}</h3>
                <span className="course-credits">{course.credits} AKTS</span>
              </div>
              <h4 className="course-name">{course.name}</h4>
              {course.description && (
                <p className="course-description">{course.description}</p>
              )}
              <div className="course-footer">
                <span className="course-ects">{course.ects} ECTS</span>
                {isAdmin && (
                  <div className="course-actions">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info('Ders düzenleme özelliği yakında eklenecek');
                      }}
                    >
                      Düzenle
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
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

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCourse.code} - {selectedCourse.name}</h2>
              <button className="modal-close" onClick={() => setSelectedCourse(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="course-detail-section">
                <h3>Açıklama</h3>
                <p>{selectedCourse.description || 'Açıklama bulunmuyor'}</p>
              </div>
              <div className="course-detail-info">
                <div className="info-item">
                  <strong>Kredi:</strong> {selectedCourse.credits}
                </div>
                <div className="info-item">
                  <strong>ECTS:</strong> {selectedCourse.ects}
                </div>
                {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
                  <div className="info-item">
                    <strong>Önkoşullar:</strong>
                    <ul>
                      {selectedCourse.prerequisites.map((prereq: any) => (
                        <li key={prereq.id}>{prereq.code} - {prereq.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

