import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { courseService } from '@/services/api/course.service';
import { sectionService } from '@/services/api/section.service';
import { enrollmentService } from '@/services/api/enrollment.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import './CourseDetailPage.css';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  const isStudent = user?.role?.toLowerCase() === 'student' || user?.role === 'STUDENT';
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role === 'ADMIN';

  // Course details
  const { data: courseData, isLoading: courseLoading, error: courseError } = useQuery(
    ['course', id],
    () => courseService.getCourseById(id!),
    {
      enabled: !!id,
      retry: 1,
      onError: (_err: any) => {
        toast.error('Ders bilgileri yüklenirken bir hata oluştu');
      },
    }
  );

  // Course sections - Sadece admin ve faculty görebilir, öğrenci göremez
  const { data: sectionsData, isLoading: sectionsLoading } = useQuery(
    ['course-sections', id],
    () => sectionService.getSectionsByCourse(id!),
    {
      enabled: !!id && !isStudent, // Öğrenci section'ları görmesin
      retry: 1,
      onError: (_err: any) => {
        console.error('Section fetch error:', _err);
      },
    }
  );

  // Öğrenci için mevcut section'ı bul (kayıt için)
  const { data: sectionsDataForEnroll } = useQuery(
    ['course-sections-enroll', id],
    () => sectionService.getSectionsByCourse(id!),
    {
      enabled: !!id && isStudent, // Sadece öğrenci için
      retry: 1,
      select: (response) => {
        // Mevcut dönem ve yıl için section bul
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const currentSemester = currentMonth >= 8 ? 'FALL' : currentMonth >= 1 ? 'SPRING' : 'SUMMER';
        
        const sections = response?.data || [];
        // Önce mevcut dönem için section bul
        const currentSection = sections.find(
          (s: any) => s.semester === currentSemester && s.year === currentYear
        );
        // Bulamazsa en yakın gelecek dönem için section bul
        return currentSection || sections.find(
          (s: any) => s.year >= currentYear
        ) || sections[0] || null;
      },
    }
  );

  const course = courseData?.data;
  const sections = sectionsData?.data || [];
  const availableSectionForEnroll = sectionsDataForEnroll || null;

  const enrollMutation = useMutation(
    (sectionId: string) => enrollmentService.enroll({ sectionId }),
    {
      onSuccess: () => {
        toast.success('Derse başarıyla kayıt oldunuz');
        setEnrollModalOpen(false);
        queryClient.invalidateQueries('my-courses');
        queryClient.invalidateQueries('course-sections');
        queryClient.invalidateQueries('course-sections-enroll');
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Derse kayıt olurken bir hata oluştu';
        toast.error(errorMessage);
      },
    }
  );

  const handleEnrollClick = () => {
    if (availableSectionForEnroll) {
      setEnrollModalOpen(true);
    } else {
      toast.error('Bu ders için kayıt olunabilecek bölüm bulunamadı');
    }
  };

  const handleConfirmEnroll = () => {
    if (availableSectionForEnroll) {
      enrollMutation.mutate(availableSectionForEnroll.id.toString());
    } else {
      toast.error('Kayıt olunabilecek bölüm bulunamadı');
    }
  };

  if (courseLoading) {
    return (
      <div className="course-detail-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="course-detail-page">
        <div className="error-message">
          <h3>Ders bulunamadı</h3>
          <Button onClick={() => navigate('/courses')}>Derslere Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Dersler', to: '/courses' },
          { label: course.code },
        ]}
      />
      <PageHeader
        title={`${course.code} - ${course.name}`}
        description={course.description || 'Ders detayları'}
      />

      <div className="course-detail-grid">
        {/* Course Info */}
        <Card className="course-info-card">
          <CardHeader>
            <CardTitle>Ders Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Ders Kodu:</span>
                <span className="info-value">{course.code}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ders Adı:</span>
                <span className="info-value">{course.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Kredi:</span>
                <span className="info-value">{course.credits}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ECTS:</span>
                <span className="info-value">{course.ects}</span>
              </div>
              {course.description && (
                <div className="info-item full-width">
                  <span className="info-label">Açıklama:</span>
                  <span className="info-value">{course.description}</span>
                </div>
              )}
            </div>

            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="prerequisites-section">
                <h3>Önkoşullar</h3>
                <ul className="prerequisites-list">
                  {course.prerequisites.map((prereq: any) => (
                    <li key={prereq.id}>
                      <Link to={`/courses/${prereq.id}`} className="prerequisite-link">
                        {prereq.code} - {prereq.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Sections - Sadece admin ve faculty görebilir */}
        {!isStudent && (
          <Card className="sections-card">
            <CardHeader>
              <CardTitle>Mevcut Bölümler</CardTitle>
            </CardHeader>
            <CardContent>
              {sectionsLoading ? (
                <LoadingSpinner />
              ) : sections.length === 0 ? (
                <div className="empty-state">
                  <p>Bu ders için henüz bölüm açılmamış</p>
                </div>
              ) : (
                <div className="sections-list">
                  {sections.map((section: any) => {
                    // Backend'den instructorName direkt string olarak geliyor
                    const instructorName = section.instructorName || 'Atanmamış';
                    const capacity = section.capacity || 0;
                    const enrolled = section.enrolledCount || 0;
                    const isFull = enrolled >= capacity;

                    return (
                      <div key={section.id} className="section-item">
                        <div className="section-header">
                          <h4>Bölüm {section.sectionNumber}</h4>
                          <Badge variant={isFull ? 'error' : 'primary'}>
                            {enrolled} / {capacity}
                          </Badge>
                        </div>
                        <div className="section-details">
                          <div className="detail-row">
                            <span className="detail-label">Öğretim Üyesi:</span>
                            <span className="detail-value">{instructorName}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Dönem:</span>
                            <span className="detail-value">
                              {section.semester} {section.year}
                            </span>
                          </div>
                          {section.classroomName && (
                            <div className="detail-row">
                              <span className="detail-label">Sınıf:</span>
                              <span className="detail-value">{section.classroomName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Öğrenci için kayıt butonu */}
        {isStudent && (
          <Card className="enroll-card">
            <CardHeader>
              <CardTitle>Derse Kayıt</CardTitle>
            </CardHeader>
            <CardContent>
              {availableSectionForEnroll ? (
                <div className="enroll-info">
                  <div className="enroll-details">
                    <div className="detail-row">
                      <span className="detail-label">Öğretim Üyesi:</span>
                      <span className="detail-value">
                        {availableSectionForEnroll.instructorName || 'Atanmamış'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Dönem:</span>
                      <span className="detail-value">
                        {availableSectionForEnroll.semester} {availableSectionForEnroll.year}
                      </span>
                    </div>
                    {availableSectionForEnroll.classroomName && (
                      <div className="detail-row">
                        <span className="detail-label">Sınıf:</span>
                        <span className="detail-value">
                          {availableSectionForEnroll.classroomName}
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Kapasite:</span>
                      <span className="detail-value">
                        {availableSectionForEnroll.enrolledCount || 0} / {availableSectionForEnroll.capacity || 0}
                      </span>
                    </div>
                  </div>
                  <div className="enroll-action">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleEnrollClick}
                      disabled={
                        (availableSectionForEnroll.enrolledCount || 0) >= (availableSectionForEnroll.capacity || 0) ||
                        enrollMutation.isLoading
                      }
                      isLoading={enrollMutation.isLoading}
                    >
                      {enrollMutation.isLoading
                        ? 'Kayıt Yapılıyor...'
                        : (availableSectionForEnroll.enrolledCount || 0) >= (availableSectionForEnroll.capacity || 0)
                        ? 'Ders Dolu'
                        : 'Derse Kayıt Ol'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Bu ders için kayıt olunabilecek bölüm bulunamadı</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enrollment Confirmation Modal */}
      <Modal
        isOpen={enrollModalOpen}
        onClose={() => {
          setEnrollModalOpen(false);
        }}
        title="Derse Kayıt Ol"
        size="md"
      >
        {availableSectionForEnroll && (
          <div className="enroll-modal-content">
            <div className="enroll-info">
              <p><strong>Ders:</strong> {course.code} - {course.name}</p>
              <p><strong>Öğretim Üyesi:</strong> {availableSectionForEnroll.instructorName || 'Atanmamış'}</p>
              <p><strong>Dönem:</strong> {availableSectionForEnroll.semester} {availableSectionForEnroll.year}</p>
              {availableSectionForEnroll.classroomName && (
                <p><strong>Sınıf:</strong> {availableSectionForEnroll.classroomName}</p>
              )}
            </div>
            <div className="enroll-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setEnrollModalOpen(false);
                }}
              >
                İptal
              </Button>
              <Button
                onClick={handleConfirmEnroll}
                disabled={enrollMutation.isLoading}
                isLoading={enrollMutation.isLoading}
              >
                {enrollMutation.isLoading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
