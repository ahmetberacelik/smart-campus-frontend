import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { sectionService } from '@/services/api/section.service';
import { attendanceService } from '@/services/api/attendance.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import './AttendanceReportPage.css';

export const AttendanceReportPage: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Section details
  const { data: sectionData, isLoading: sectionLoading } = useQuery(
    ['section', sectionId],
    () => sectionService.getSectionById(sectionId!),
    {
      enabled: !!sectionId,
      retry: 1,
    }
  );

  // Attendance report
  const { data: reportData, isLoading: reportLoading } = useQuery(
    ['attendance-report', sectionId, dateFrom, dateTo],
    () => attendanceService.getAttendanceReport(sectionId!, {
      page: 0,
      limit: 100,
    }),
    {
      enabled: !!sectionId,
      retry: 1,
    }
  );

  const section = sectionData?.data;
  const pageData = reportData?.data;
  const students = pageData?.content || pageData?.students || [];

  const handleExport = () => {
    toast.info('Excel export özelliği yakında eklenecek');
  };

  if (sectionLoading || reportLoading) {
    return (
      <div className="attendance-report-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="attendance-report-page">
        <div className="error-message">
          <h3>Bölüm bulunamadı</h3>
          <Button onClick={() => navigate('/sections')}>Bölümlere Dön</Button>
        </div>
      </div>
    );
  }

  const course = section.course || {};

  return (
    <div className="attendance-report-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Ders Bölümleri', to: '/sections' },
          { label: `${course.code} - Yoklama Raporu` },
        ]}
      />
      <PageHeader
        title={`Yoklama Raporu - ${course.code} ${course.name}`}
        description={`Bölüm ${section.sectionNumber} - ${section.semester} ${section.year}`}
        actions={
          <Button
            variant="secondary"
            onClick={handleExport}
          >
            Excel'e Aktar
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="report-filters">
            <div className="filter-group">
              <label>Başlangıç Tarihi:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Bitiş Tarihi:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="report-table-container">
            <Table>
              <thead>
                <tr>
                  <th>Öğrenci No</th>
                  <th>Ad Soyad</th>
                  <th>Toplam Oturum</th>
                  <th>Katılım</th>
                  <th>Devamsız</th>
                  <th>Yoklama %</th>
                  <th>Durum</th>
                  <th>Uyarı</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-cell">
                      Henüz yoklama kaydı bulunmuyor
                    </td>
                  </tr>
                ) : (
                  students.map((student: any) => {
                    const totalSessions = student.totalSessions || 0;
                    const attendedSessions = student.attendedSessions || 0;
                    const absences = totalSessions - attendedSessions;
                    const percentage = totalSessions > 0
                      ? (attendedSessions / totalSessions) * 100
                      : 0;
                    const status = percentage >= 80 ? 'NORMAL' : percentage >= 60 ? 'WARNING' : 'CRITICAL';
                    const isFlagged = student.isSuspicious || false;

                    return (
                      <tr key={student.enrollmentId || student.studentId}>
                        <td>{student.studentNumber}</td>
                        <td>{student.studentName}</td>
                        <td>{totalSessions}</td>
                        <td>{attendedSessions}</td>
                        <td>{absences}</td>
                        <td>
                          <span className={`percentage-value percentage-${status.toLowerCase()}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          <Badge variant={status === 'CRITICAL' ? 'error' : status === 'WARNING' ? 'warning' : 'success'}>
                            {status === 'NORMAL' ? 'Normal' : status === 'WARNING' ? 'Uyarı' : 'Kritik'}
                          </Badge>
                        </td>
                        <td>
                          {isFlagged && (
                            <Badge variant="error">Şüpheli</Badge>
                          )}
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
