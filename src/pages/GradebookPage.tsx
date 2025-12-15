import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { sectionService } from '@/services/api/section.service';
import { enrollmentService } from '@/services/api/enrollment.service';
import { gradeService, type EnterGradeRequest } from '@/services/api/grade.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import './GradebookPage.css';

export const GradebookPage: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [grades, setGrades] = useState<Record<string, { midterm?: number; final?: number; letterGrade?: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  // Section details
  const { data: sectionData, isLoading: sectionLoading } = useQuery(
    ['section', sectionId],
    () => sectionService.getSectionById(sectionId!),
    {
      enabled: !!sectionId,
      retry: 1,
      onError: (err: any) => {
        toast.error('Bölüm bilgileri yüklenirken bir hata oluştu');
      },
    }
  );

  // Section students
  const { data: studentsData, isLoading: studentsLoading } = useQuery(
    ['section-students', sectionId],
    () => enrollmentService.getSectionStudents(sectionId!),
    {
      enabled: !!sectionId,
      retry: 1,
      onError: (err: any) => {
        toast.error('Öğrenci listesi yüklenirken bir hata oluştu');
      },
    }
  );

  const section = sectionData?.data;
  const pageData = studentsData?.data;
  const students = pageData?.content || pageData || [];

  const handleGradeChange = (enrollmentId: string, field: 'midterm' | 'final' | 'letterGrade', value: string) => {
    setGrades((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: field === 'letterGrade' ? value : value ? parseFloat(value) : undefined,
      },
    }));
  };

  const calculateLetterGrade = (midterm: number | undefined, final: number | undefined): string => {
    if (midterm === undefined || final === undefined) return '';
    const average = (midterm * 0.4) + (final * 0.6);
    
    if (average >= 90) return 'AA';
    if (average >= 85) return 'BA';
    if (average >= 80) return 'BB';
    if (average >= 75) return 'CB';
    if (average >= 70) return 'CC';
    if (average >= 65) return 'DC';
    if (average >= 60) return 'DD';
    if (average >= 50) return 'FD';
    return 'FF';
  };

  const saveGradeMutation = useMutation(
    ({ enrollmentId, data }: { enrollmentId: string; data: EnterGradeRequest }) =>
      gradeService.enterGrade({ enrollmentId, ...data }),
    {
      onSuccess: () => {
        toast.success('Not başarıyla kaydedildi');
        queryClient.invalidateQueries('section-students');
        setSaving(null);
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Not kaydedilirken bir hata oluştu');
        setSaving(null);
      },
    }
  );

  const handleSaveGrade = async (enrollmentId: string) => {
    const gradeData = grades[enrollmentId];
    if (!gradeData) return;

    setSaving(enrollmentId);
    
    const data: EnterGradeRequest = {};
    if (gradeData.midterm !== undefined) data.midtermGrade = gradeData.midterm;
    if (gradeData.final !== undefined) data.finalGrade = gradeData.final;
    if (gradeData.letterGrade) data.letterGrade = gradeData.letterGrade;

    await saveGradeMutation.mutateAsync({ enrollmentId, data });
  };

  const handleBulkSave = async () => {
    for (const enrollmentId of Object.keys(grades)) {
      await handleSaveGrade(enrollmentId);
    }
  };

  if (sectionLoading || studentsLoading) {
    return (
      <div className="gradebook-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="gradebook-page">
        <div className="error-message">
          <h3>Bölüm bulunamadı</h3>
          <Button onClick={() => navigate('/sections')}>Bölümlere Dön</Button>
        </div>
      </div>
    );
  }

  const course = section.course || {};

  return (
    <div className="gradebook-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Ders Bölümleri', to: '/sections' },
          { label: `${course.code} - Bölüm ${section.sectionNumber}` },
        ]}
      />
      <PageHeader
        title={`Not Defteri - ${course.code} ${course.name}`}
        description={`Bölüm ${section.sectionNumber} - ${section.semester} ${section.year}`}
        actions={
          <Button
            onClick={handleBulkSave}
            disabled={Object.keys(grades).length === 0 || saveGradeMutation.isLoading}
          >
            Tümünü Kaydet
          </Button>
        }
      />

      <Card>
        <CardContent>
          <div className="gradebook-table-container">
            <Table>
              <thead>
                <tr>
                  <th>Öğrenci No</th>
                  <th>Ad Soyad</th>
                  <th>Vize</th>
                  <th>Final</th>
                  <th>Ortalama</th>
                  <th>Harf Notu</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-cell">
                      Henüz öğrenci kaydı bulunmuyor
                    </td>
                  </tr>
                ) : (
                  students.map((enrollment: any) => {
                    const student = enrollment.student || {};
                    const studentName = student.name || 
                      `${student.firstName || ''} ${student.lastName || ''}`.trim();
                    const studentNumber = student.studentNumber || '-';
                    
                    const gradeData = grades[enrollment.id] || {};
                    const midterm = gradeData.midterm ?? enrollment.midtermGrade;
                    const final = gradeData.final ?? enrollment.finalGrade;
                    const average = midterm !== undefined && final !== undefined 
                      ? (midterm * 0.4) + (final * 0.6) 
                      : undefined;
                    const calculatedLetter = average !== undefined ? calculateLetterGrade(midterm, final) : '';
                    const letterGrade = gradeData.letterGrade ?? enrollment.letterGrade ?? calculatedLetter;

                    const hasChanges = 
                      gradeData.midterm !== undefined || 
                      gradeData.final !== undefined || 
                      gradeData.letterGrade !== undefined;

                    return (
                      <tr key={enrollment.id}>
                        <td>{studentNumber}</td>
                        <td>{studentName}</td>
                        <td>
                          <TextInput
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={midterm?.toString() || ''}
                            onChange={(e) => handleGradeChange(enrollment.id, 'midterm', e.target.value)}
                            placeholder="0.00"
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td>
                          <TextInput
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={final?.toString() || ''}
                            onChange={(e) => handleGradeChange(enrollment.id, 'final', e.target.value)}
                            placeholder="0.00"
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td>
                          <span className="average-value">
                            {average !== undefined ? average.toFixed(2) : '-'}
                          </span>
                        </td>
                        <td>
                          <TextInput
                            type="text"
                            value={letterGrade}
                            onChange={(e) => handleGradeChange(enrollment.id, 'letterGrade', e.target.value.toUpperCase())}
                            placeholder="AA"
                            style={{ width: '60px', textAlign: 'center' }}
                            maxLength={2}
                          />
                        </td>
                        <td>
                          <Button
                            size="sm"
                            onClick={() => handleSaveGrade(enrollment.id)}
                            disabled={!hasChanges || saving === enrollment.id}
                          >
                            {saving === enrollment.id ? 'Kaydediliyor...' : 'Kaydet'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
