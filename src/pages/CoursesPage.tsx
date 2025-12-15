import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { courseService, type CourseListParams } from '@/services/api/course.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { Select } from '@/components/common/Select';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import './CoursesPage.css';

export const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  // Not: Enrollment işlemi artık CourseDetailPage'de yapılıyor
  // Bu sayede backend'deki 500 hatalarından bağımsız çalışıyoruz

  const handleEnrollClick = (e: React.MouseEvent, course: any) => {
    e.stopPropagation();
    // Backend'de 500 hatası olduğu için direkt CourseDetailPage'e yönlendiriyoruz
    // Orada zaten çalışan bir enrollment sistemi var
    navigate(`/courses/${course.id}`);
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role === 'ADMIN';
  const isStudent = user?.role?.toLowerCase() === 'student' || user?.role === 'STUDENT';

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
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Dersler' },
        ]}
      />
      <PageHeader
        title="Dersler"
        description="Tüm dersleri görüntüleyin, arayın ve detaylarını inceleyin."
        actions={
          isAdmin ? (
            <Button onClick={() => toast.info('Ders oluşturma özelliği yakında eklenecek')}>
              Yeni Ders Ekle
            </Button>
          ) : undefined
        }
      />

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
          <Card className="courses-empty-state">
            <CardContent>
              <p>Ders bulunamadı</p>
            </CardContent>
          </Card>
        ) : (
          courses.map((course: any) => (
            <Card
              key={course.id}
              variant="default"
              className="course-card"
              onClick={() => handleCourseClick(course.id)}
            >
              <CardHeader>
                <div className="course-card-header">
                  <CardTitle>{course.code}</CardTitle>
                  <Badge variant="primary">{course.credits} AKTS</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="course-name">{course.name}</h4>
                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}
                <div className="course-footer">
                  <Badge variant="default">{course.ects} ECTS</Badge>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isStudent && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => handleEnrollClick(e, course)}
                      >
                        Kayıt Ol
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info('Ders düzenleme özelliği yakında eklenecek');
                        }}
                      >
                        Düzenle
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
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
      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse ? `${selectedCourse.code} - ${selectedCourse.name}` : ''}
        size="lg"
      >
        {selectedCourse && (
          <div className="course-detail-content">
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
        )}
      </Modal>
    </div>
  );
};

