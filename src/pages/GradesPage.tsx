import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { gradeService } from '@/services/api/grade.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { format } from 'date-fns';
import './GradesPage.css';

export const GradesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showTranscript, setShowTranscript] = useState(false);

  const { data: gradesData, isLoading: gradesLoading, error: gradesError } = useQuery(
    'my-grades',
    () => gradeService.getMyGrades(),
    {
      retry: 1,
      onError: (err: any) => {
        const statusCode = err?.response?.status || err?.status;
        if (statusCode === 401) {
          toast.error('Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.');
          setTimeout(() => {
            localStorage.clear();
            navigate('/login');
          }, 2000);
        }
      },
    }
  );

  const { data: transcriptData, isLoading: transcriptLoading } = useQuery(
    'transcript',
    () => gradeService.getTranscript(),
    {
      enabled: showTranscript,
      retry: 1,
    }
  );

  const handleDownloadTranscript = async () => {
    try {
      const blob = await gradeService.getTranscriptPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transcript.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Transkript indirildi');
    } catch (error: any) {
      toast.error('Transkript indirilirken bir hata oluştu');
    }
  };

  if (gradesLoading) {
    return (
      <div className="grades-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (gradesError) {
    const errorData = gradesError as any;
    const statusCode = errorData?.response?.status || errorData?.status;
    
    if (statusCode === 401) {
      return (
        <div className="grades-page">
          <div className="error-message">
            <h3>Kimlik Doğrulama Gerekli</h3>
            <p>Oturumunuzun süresi dolmuş olabilir. Lütfen tekrar giriş yapın.</p>
            <Button 
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}
              style={{ marginTop: '1rem' }}
            >
              Giriş Sayfasına Dön
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="grades-page">
        <div className="error-message">
          <h3>Hata Oluştu</h3>
          <p>{errorData?.message || 'Notlar yüklenirken bir hata oluştu'}</p>
        </div>
      </div>
    );
  }

  const grades = gradesData?.data || [];
  const transcript = transcriptData?.data;

  return (
    <div className="grades-page">
      <div className="grades-header">
        <div>
          <h1>Notlarım</h1>
          <p className="subtitle">Tüm ders notlarınızı buradan görüntüleyebilirsiniz</p>
        </div>
        <div className="grades-actions">
          <Button
            variant="secondary"
            onClick={() => setShowTranscript(!showTranscript)}
          >
            {showTranscript ? 'Notları Gizle' : 'Transkript Görüntüle'}
          </Button>
          <Button onClick={handleDownloadTranscript}>
            Transkript İndir (PDF)
          </Button>
        </div>
      </div>

      {/* Transcript Summary */}
      {transcript && (
        <div className="transcript-summary">
          <div className="summary-card">
            <div className="summary-label">GPA</div>
            <div className="summary-value">{transcript.gpa?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">CGPA</div>
            <div className="summary-value">{transcript.cgpa?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Toplam Ders</div>
            <div className="summary-value">{transcript.courses?.length || 0}</div>
          </div>
        </div>
      )}

      {/* Transcript View */}
      {showTranscript && transcript && (
        <div className="transcript-view">
          <h2>Transkript</h2>
          <div className="transcript-info">
            <div className="info-row">
              <strong>Öğrenci:</strong> {transcript.studentName || transcript.student?.name}
            </div>
            <div className="info-row">
              <strong>Öğrenci No:</strong> {transcript.studentNumber || transcript.student?.studentNumber}
            </div>
            <div className="info-row">
              <strong>Bölüm:</strong> {transcript.departmentName}
            </div>
          </div>
          <table className="transcript-table">
            <thead>
              <tr>
                <th>Ders Kodu</th>
                <th>Ders Adı</th>
                <th>Kredi</th>
                <th>ECTS</th>
                <th>Dönem</th>
                <th>Harf Notu</th>
                <th>Not Puanı</th>
              </tr>
            </thead>
            <tbody>
              {transcript.courses?.map((course: any, index: number) => (
                <tr key={index}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>{course.credits}</td>
                  <td>{course.ects}</td>
                  <td>{course.semester} {course.year}</td>
                  <td>
                    <span className={`grade-badge grade-${course.letterGrade?.toLowerCase()}`}>
                      {course.letterGrade || '-'}
                    </span>
                  </td>
                  <td>{course.gradePoint?.toFixed(2) || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grades List */}
      <div className="grades-section">
        <h2>Ders Notları</h2>
        {grades.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            <h3>Henüz notunuz bulunmuyor</h3>
            <p>Dersleriniz için notlar girildikçe burada görünecektir</p>
          </div>
        ) : (
          <div className="grades-grid">
            {grades.map((grade: any) => {
              const section = grade.section || {};
              const course = section.course || {};

              return (
                <div key={grade.id} className="grade-card">
                  <div className="grade-card-header">
                    <div>
                      <h3 className="course-code">{course.code}</h3>
                      <h4 className="course-name">{course.name}</h4>
                    </div>
                    {grade.letterGrade && (
                      <span className={`grade-badge-large grade-${grade.letterGrade.toLowerCase()}`}>
                        {grade.letterGrade}
                      </span>
                    )}
                  </div>

                  <div className="grade-details">
                    {grade.midtermGrade !== null && grade.midtermGrade !== undefined && (
                      <div className="grade-item">
                        <span className="grade-label">Vize:</span>
                        <span className="grade-value">{grade.midtermGrade.toFixed(2)}</span>
                      </div>
                    )}
                    {grade.finalGrade !== null && grade.finalGrade !== undefined && (
                      <div className="grade-item">
                        <span className="grade-label">Final:</span>
                        <span className="grade-value">{grade.finalGrade.toFixed(2)}</span>
                      </div>
                    )}
                    {grade.gradePoint !== null && grade.gradePoint !== undefined && (
                      <div className="grade-item">
                        <span className="grade-label">Not Puanı:</span>
                        <span className="grade-value">{grade.gradePoint.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="grade-item">
                      <span className="grade-label">Dönem:</span>
                      <span className="grade-value">
                        {section.semester} {section.year}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

