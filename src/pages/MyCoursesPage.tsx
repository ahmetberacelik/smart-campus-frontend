import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { enrollmentService } from '@/services/api/enrollment.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { format } from 'date-fns';
import './MyCoursesPage.css';

export const MyCoursesPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    'my-courses',
    () => enrollmentService.getMyCourses(),
    {
      retry: 1,
      onError: (err: any) => {
        console.error('My courses fetch error:', err);
        toast.error(err?.message || 'Dersler yüklenirken bir hata oluştu');
      },
    }
  );

  const dropMutation = useMutation(
    (enrollmentId: string) => enrollmentService.dropEnrollment(enrollmentId),
    {
      onSuccess: () => {
        toast.success('Ders başarıyla bırakıldı');
        queryClient.invalidateQueries('my-courses');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Ders bırakılırken bir hata oluştu');
      },
    }
  );

  const handleDrop = async (enrollmentId: string, courseName: string) => {
    if (!window.confirm(`${courseName} dersini bırakmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await dropMutation.mutateAsync(enrollmentId);
    } catch (error) {
      // Error handled in mutation
    }
  };

  if (isLoading) {
    return (
      <div className="my-courses-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.message || 'Dersler yüklenirken bir hata oluştu';
    return (
      <div className="my-courses-page">
        <div className="error-message">
          <h3>Hata Oluştu</h3>
          <p>{errorMessage}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Backend'in çalıştığından emin olun: http://localhost:8081/actuator/health
          </p>
        </div>
      </div>
    );
  }

  const enrollments = data?.data || [];

  return (
    <div className="my-courses-page">
      <div className="my-courses-header">
        <h1>Kayıtlı Derslerim</h1>
        <p className="subtitle">Toplam {enrollments.length} ders</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H7V10H17V12ZM15 16H7V14H15V16ZM17 8H7V6H17V8Z" fill="currentColor"/>
          </svg>
          <h3>Henüz kayıtlı dersiniz yok</h3>
          <p>Dersler sayfasından derslere kayıt olabilirsiniz</p>
        </div>
      ) : (
        <div className="enrollments-grid">
          {enrollments.map((enrollment: any) => {
            const section = enrollment.section || {};
            const course = section.course || {};
            const enrollmentDate = enrollment.enrollmentDate
              ? format(new Date(enrollment.enrollmentDate), 'dd MMM yyyy')
              : '';

            return (
              <div key={enrollment.id} className="enrollment-card">
                <div className="enrollment-card-header">
                  <div>
                    <h3 className="course-code">{course.code}</h3>
                    <h4 className="course-name">{course.name}</h4>
                  </div>
                  <span className={`status-badge status-${enrollment.status?.toLowerCase()}`}>
                    {enrollment.status === 'ACTIVE' ? 'Aktif' : enrollment.status}
                  </span>
                </div>

                <div className="enrollment-details">
                  <div className="detail-item">
                    <span className="detail-label">Bölüm:</span>
                    <span className="detail-value">{section.sectionNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Dönem:</span>
                    <span className="detail-value">
                      {section.semester} {section.year}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Kayıt Tarihi:</span>
                    <span className="detail-value">{enrollmentDate}</span>
                  </div>
                  {section.instructor && (
                    <div className="detail-item">
                      <span className="detail-label">Öğretim Üyesi:</span>
                      <span className="detail-value">
                        {section.instructor.name || 
                         `${section.instructor.firstName} ${section.instructor.lastName}`}
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Kapasite:</span>
                    <span className="detail-value">
                      {section.enrolledCount || 0} / {section.capacity || 0}
                    </span>
                  </div>
                </div>

                {enrollment.status === 'ACTIVE' && (
                  <div className="enrollment-actions">
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDrop(enrollment.id, course.name)}
                      disabled={dropMutation.isLoading}
                    >
                      Dersi Bırak
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

