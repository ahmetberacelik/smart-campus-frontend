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
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  const isStudent = user?.role?.toLowerCase() === 'student' || user?.role === 'STUDENT';

  // Course details
  const { data: courseData, isLoading: courseLoading, error: courseError } = useQuery(
    ['course', id],
    () => courseService.getCourseById(id!),
    {
      enabled: !!id,
      retry: 1,
      onError: (err: any) => {
        toast.error('Ders bilgileri yüklenirken bir hata oluştu');
      },
    }
  );

  // Course sections
  const { data: sectionsData, isLoading: sectionsLoading } = useQuery(
    ['course-sections', id],
    () => sectionService.getSections({}),
    {
      enabled: !!id,
      retry: 1,
      select: (data) => {
        // Filter sections for this course
        const sections = data?.data || [];
        return sections.filter((section: any) => section.course?.id?.toString() === id);
      },
    }
  );

  const course = courseData?.data;
  const sections = sectionsData?.data || [];

  const enrollMutation = useMutation(
    (sectionId: string) => enrollmentService.enroll({ sectionId }),
    {
      onSuccess: () => {
        toast.success('Derse başarıyla kayıt oldunuz');
        setEnrollModalOpen(false);
        setSelectedSection(null);
        queryClient.invalidateQueries('my-courses');
        queryClient.invalidateQueries('course-sections');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Derse kayıt olurken bir hata oluştu');
      },
    }
  );

  const handleEnrollClick = (section: any) => {
    setSelectedSection(section);
    setEnrollModalOpen(true);
  };

  const handleConfirmEnroll = () => {
    if (selectedSection) {
      enrollMutation.mutate(selectedSection.id.toString());
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

        {/* Available Sections */}
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
                  const instructor = section.instructor || {};
                  const instructorName = instructor.name || 
                    `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim();
                  const capacity = section.capacity || 0;
                  const enrolled = section.enrolledCount || 0;
                  const isFull = enrolled >= capacity;

                  return (
                    <div key={section.id} className="section-item">
                      <div className="section-header">
                        <h4>Bölüm {section.sectionNumber}</h4>
                        <Badge variant={isFull ? 'danger' : 'primary'}>
                          {enrolled} / {capacity}
                        </Badge>
                      </div>
                      <div className="section-details">
                        <div className="detail-row">
                          <span className="detail-label">Öğretim Üyesi:</span>
                          <span className="detail-value">{instructorName || 'Atanmamış'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Dönem:</span>
                          <span className="detail-value">
                            {section.semester} {section.year}
                          </span>
                        </div>
                        {section.classroom && (
                          <div className="detail-row">
                            <span className="detail-label">Sınıf:</span>
                            <span className="detail-value">{section.classroom.name || section.classroom.code}</span>
                          </div>
                        )}
                      </div>
                      {isStudent && (
                        <div className="section-actions">
                          <Button
                            variant={isFull ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => handleEnrollClick(section)}
                            disabled={isFull || enrollMutation.isLoading}
                          >
                            {isFull ? 'Dolu' : 'Kayıt Ol'}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Confirmation Modal */}
      <Modal
        isOpen={enrollModalOpen}
        onClose={() => {
          setEnrollModalOpen(false);
          setSelectedSection(null);
        }}
        title="Derse Kayıt Ol"
        size="md"
      >
        {selectedSection && (
          <div className="enroll-modal-content">
            <div className="enroll-info">
              <p><strong>Ders:</strong> {course.code} - {course.name}</p>
              <p><strong>Bölüm:</strong> {selectedSection.sectionNumber}</p>
              <p><strong>Dönem:</strong> {selectedSection.semester} {selectedSection.year}</p>
            </div>
            <div className="enroll-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setEnrollModalOpen(false);
                  setSelectedSection(null);
                }}
              >
                İptal
              </Button>
              <Button
                onClick={handleConfirmEnroll}
                disabled={enrollMutation.isLoading}
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
