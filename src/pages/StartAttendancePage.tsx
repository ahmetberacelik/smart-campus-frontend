import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { sectionService } from '@/services/api/section.service';
import { attendanceService, type CreateAttendanceSessionRequest } from '@/services/api/attendance.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { TextInput } from '@/components/common/TextInput';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import './StartAttendancePage.css';

// Mevcut semester ve year'ı hesapla
const getCurrentSemesterAndYear = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  // Türkiye'de akademik yıl: Eylül (9) - Ocak (1) = Fall, Şubat (2) - Haziran (6) = Spring
  // Basit mantık: Eylül-Aralık ve Ocak = Fall, Şubat-Haziran = Spring
  let semester: string;
  let academicYear: number;

  if (month >= 9 || month === 1) {
    // Fall (Güz) dönemi
    semester = 'FALL';
    academicYear = month === 1 ? year - 1 : year;
  } else if (month >= 2 && month <= 6) {
    // Spring (Bahar) dönemi
    semester = 'SPRING';
    academicYear = year;
  } else {
    // Yaz dönemi (July-August) - genelde Spring döneminin devamı olarak kabul edilir
    semester = 'SPRING';
    academicYear = year;
  }

  return { semester, year: academicYear };
};

export const StartAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [geofenceRadius, setGeofenceRadius] = useState<number>(15);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('09:30');

  // Semester ve year state'leri (manuel seçim için)
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(0);

  // Mevcut semester ve year bilgisi (varsayılan değerler)
  const defaultSemesterYear = useMemo(() => getCurrentSemesterAndYear(), []);

  // Kullanıcı seçim yapmadıysa varsayılan değerleri kullan
  const semester = selectedSemester || defaultSemesterYear.semester;
  const year = selectedYear || defaultSemesterYear.year;

  // Kullanıcının bölüm ID'sini al (giriş yaparken seçilen bölüm)
  const userDepartmentId = user?.facultyInfo?.departmentId?.toString() || user?.studentInfo?.departmentId?.toString();

  // Database'deki mevcut yılları getir
  const { data: availableYearsData } = useQuery(
    'available-years',
    () => sectionService.getAvailableYears(),
    {
      onSuccess: (data) => {
        console.log('📅 Database\'de mevcut yıllar:', data?.data || []);
      },
      onError: (error: any) => {
        console.warn('⚠️ Mevcut yıllar alınamadı:', error);
      },
    }
  );

  const availableYears = availableYearsData?.data || [];

  console.log('User Department ID:', userDepartmentId);
  console.log('User Info:', {
    facultyInfo: user?.facultyInfo,
    studentInfo: user?.studentInfo,
    role: user?.role
  });
  console.log('📅 Database\'de mevcut yıllar:', availableYears);

  // /my-sections endpoint'i 403 veriyor, bu yüzden direkt /sections/semester/list kullanıyoruz
  // Bu endpoint daha geniş erişime sahip ve tüm section'ları döndürüyor, client-side'da filtreleyeceğiz
  const shouldSkipMySections = true; // /my-sections endpoint'i yetki sorunu verdiği için atlıyoruz

  // Kullanıcının bölümüne ait tüm ders bölümlerini getir
  const shouldFetchAllSections = shouldSkipMySections || true; // Her zaman tüm section'ları çek

  const { data: allSectionsData, isLoading: allSectionsLoading, isError: allSectionsError, error: allSectionsErrorDetail } = useQuery(
    ['all-sections', semester, year],
    async () => {
      console.log('📡 Tüm ders bölümleri getiriliyor, semester:', semester, 'year:', year);
      try {
        const result = await sectionService.getSectionsBySemester(semester, year);
        console.log('✅ getSectionsBySemester sonucu:', result);
        return result;
      } catch (error: any) {
        console.error('❌ getSectionsBySemester catch hatası:', error);
        throw error;
      }
    },
    {
      enabled: shouldFetchAllSections,
      retry: false, // 403 hatası için retry yapma
      onSuccess: (data) => {
        console.log('✅ Tüm ders bölümleri başarıyla getirildi:', data?.data?.length || 0);
        if (data?.data && data.data.length === 0) {
          console.warn('⚠️ Backend\'den ders bölümü döndü ama liste boş - muhtemelen bu dönem için veri yok');
        }
      },
      onError: (error: any) => {
        console.error('❌ Ders bölümleri yüklenirken hata:', error);
        console.error('❌ Hata detayı:', {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          message: error?.message,
          url: error?.config?.url
        });

        // 403 hatası ise özel mesaj
        if (error?.response?.status === 403) {
          toast.error('Bu işlem için yetkiniz yok. Lütfen sistem yöneticisi ile iletişime geçin.');
        } else {
          const errorMessage = error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            error?.message ||
            'Ders bölümleri yüklenirken bir hata oluştu';
          toast.error(errorMessage);
        }
      },
    }
  );

  // Ders bölümlerini belirle: kullanıcının bölümüne ait tüm dersleri göster
  const sections = useMemo(() => {
    const allSections = allSectionsData?.data || [];

    console.log('Sections hesaplanıyor...', {
      allSectionsCount: allSections.length,
      allSectionsError,
      userDepartmentId
    });

    if (allSectionsError) {
      console.error('❌ Tüm dersler getirilemedi:', allSectionsErrorDetail);
      return [];
    }

    if (!userDepartmentId) {
      // Bölüm ID yoksa tümünü göster
      console.log('⚠️ Kullanıcı bölüm ID yok, tüm dersler gösteriliyor:', allSections.length);
      return allSections;
    }

    // Kullanıcının bölümüne ait ders bölümlerini filtrele
    // Backend'den courseDepartmentId veya course.departmentId gelebilir
    const departmentSections = allSections.filter((section: any) => {
      // Önce courseDepartmentId'yi kontrol et (backend'den direkt gelebilir)
      // Sonra course.departmentId'yi kontrol et (nested object)
      const courseDepartmentId = section.courseDepartmentId?.toString() ||
        section.course?.departmentId?.toString();
      const matches = courseDepartmentId === userDepartmentId;

      // Debug: İlk 5 section'ın detaylarını göster
      if (allSections.indexOf(section) < 5) {
        console.log('🔍 Section detayı:', {
          sectionId: section.id,
          courseName: section.courseName || section.course?.name,
          courseDepartmentId: courseDepartmentId,
          courseDepartmentId_direct: section.courseDepartmentId,
          courseDepartmentId_nested: section.course?.departmentId,
          userDepartmentId: userDepartmentId,
          matches: matches
        });
      }

      return matches;
    });

    console.log(`✅ Kullanıcının bölümüne (${userDepartmentId}) ait ${departmentSections.length} ders bölümü bulundu. Toplam: ${allSections.length}`);

    // Eğer filtreleme sonucu boşsa, tüm section'ların department ID'lerini göster
    if (departmentSections.length === 0 && allSections.length > 0) {
      console.warn('⚠️ Filtreleme sonucu boş! Tüm section\'ların department ID\'leri:');
      allSections.slice(0, 10).forEach((section: any) => {
        const deptId = section.courseDepartmentId || section.course?.departmentId;
        const courseName = section.courseName || section.course?.name || 'Bilinmiyor';
        console.warn(`  - ${courseName}: departmentId = ${deptId} (userDepartmentId = ${userDepartmentId})`);
      });
    }

    return departmentSections;
  }, [allSectionsData, allSectionsError, allSectionsErrorDetail, userDepartmentId]);

  const sectionsLoading = allSectionsLoading;

  const createSessionMutation = useMutation(
    (data: CreateAttendanceSessionRequest) => attendanceService.createSession(data),
    {
      onSuccess: (response) => {
        toast.success('Yoklama oturumu başlatıldı');
        const sessionId = response.data?.id;
        if (sessionId) {
          navigate(`/attendance/session/${sessionId}`);
        } else {
          navigate('/sections');
        }
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Yoklama oturumu başlatılırken bir hata oluştu');
      },
    }
  );

  const handleStartSession = () => {
    if (!selectedSectionId) {
      toast.error('Lütfen bir ders bölümü seçin');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error('Bitiş saati başlangıç saatinden sonra olmalıdır');
      return;
    }

    const data: CreateAttendanceSessionRequest = {
      sectionId: selectedSectionId,
      date: date,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      geofenceRadius: geofenceRadius,
    };

    createSessionMutation.mutate(data);
  };

  if (sectionsLoading) {
    return (
      <div className="start-attendance-page">
        <LoadingSpinner />
      </div>
    );
  }

  const sectionOptions = sections.map((section: any) => {
    // Backend'den course bilgisi hem düz alanlar (courseName, courseCode) hem de nested obje (course) olarak gelebilir
    const courseName = section.courseName || section.course?.name || 'Ders adı bulunamadı';
    const courseCode = section.courseCode || section.course?.code || '';
    const sectionNumber = section.sectionNumber || '';
    return {
      value: section.id.toString(),
      label: `${courseCode} - ${courseName} (Bölüm ${sectionNumber})`,
    };
  });

  return (
    <div className="start-attendance-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Yoklama Başlat' },
        ]}
      />
      <PageHeader
        title="Yoklama Oturumu Başlat"
        description="GPS tabanlı yoklama oturumu oluşturun. Öğrenciler sınıf konumuna yakın olduklarında yoklama verebilecekler."
      />

      <div className="start-attendance-container">
        <Card>
          <CardHeader>
            <CardTitle>Oturum Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="form-grid">
              <div className="form-group">
                <label>Dönem Seçin (Opsiyonel)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <Select
                    value={selectedSemester}
                    onChange={(e) => {
                      setSelectedSemester(e.target.value);
                      setSelectedSectionId(''); // Dönem değişince section'ı sıfırla
                    }}
                    options={[
                      { value: '', label: 'Mevcut Dönem (Otomatik)' },
                      { value: 'FALL', label: 'Güz (FALL)' },
                      { value: 'SPRING', label: 'Bahar (SPRING)' },
                      { value: 'SUMMER', label: 'Yaz (SUMMER)' },
                    ]}
                  />
                  <Select
                    value={selectedYear?.toString() || ''}
                    onChange={(e) => {
                      const yearValue = parseInt(e.target.value) || 0;
                      setSelectedYear(yearValue);
                      setSelectedSectionId(''); // Yıl değişince section'ı sıfırla
                    }}
                    options={[
                      { value: '', label: 'Mevcut Yıl (Otomatik)' },
                      ...availableYears.map((y) => ({ value: y.toString(), label: y.toString() })),
                    ]}
                    style={{ width: '150px' }}
                  />
                </div>
                <small style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
                  Seçili dönem: <strong>{semester} {year}</strong>
                  {selectedSemester || selectedYear ? ' (Manuel seçim)' : ' (Otomatik)'}
                  {availableYears.length > 0 && (
                    <> | Database'de mevcut yıllar: {availableYears.join(', ')}</>
                  )}
                </small>
              </div>

              <div className="form-group">
                <label>Ders Bölümü *</label>
                <Select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  options={[
                    { value: '', label: sectionOptions.length === 0 ? 'Ders bölümü bulunamadı' : 'Ders Bölümü Seçin' },
                    ...sectionOptions,
                  ]}
                  required
                  disabled={sectionsLoading || sectionOptions.length === 0}
                />
                {!sectionsLoading && sectionOptions.length === 0 && (
                  <small style={{ color: '#d32f2f', marginTop: '4px', display: 'block' }}>
                    Bu dönem ({semester} {year}) için ders bölümü bulunamadı.
                    {userDepartmentId && ` (Bölüm ID: ${userDepartmentId})`}
                    <br />
                    <span style={{ fontSize: '0.85em', fontStyle: 'italic' }}>
                      Farklı bir dönem seçmeyi deneyin veya sistem yöneticisi ile iletişime geçin.
                    </span>
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Tarih *</label>
                <TextInput
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Başlangıç Saati *</label>
                <TextInput
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bitiş Saati *</label>
                <TextInput
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Geofence Yarıçapı (metre)</label>
                <TextInput
                  type="number"
                  min="5"
                  max="100"
                  value={geofenceRadius.toString()}
                  onChange={(e) => setGeofenceRadius(parseInt(e.target.value) || 15)}
                />
                <small>Öğrencilerin sınıfa uzaklığı (varsayılan: 15m)</small>
              </div>

              <div className="form-group">
                <label>Oturum Süresi (dakika)</label>
                <TextInput
                  type="number"
                  min="5"
                  max="120"
                  value={durationMinutes.toString()}
                  onChange={(e) => {
                    const minutes = parseInt(e.target.value) || 30;
                    setDurationMinutes(minutes);
                    const start = new Date(`${date}T${startTime}`);
                    const end = new Date(start);
                    end.setMinutes(end.getMinutes() + minutes);
                    setEndTime(end.toTimeString().slice(0, 5));
                  }}
                />
              </div>
            </div>

            <div className="form-actions">
              <Button
                variant="secondary"
                onClick={() => navigate('/sections')}
              >
                İptal
              </Button>
              <Button
                onClick={handleStartSession}
                disabled={!selectedSectionId || createSessionMutation.isLoading}
              >
                {createSessionMutation.isLoading ? 'Başlatılıyor...' : 'Oturumu Başlat'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
