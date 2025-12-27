/**
 * Admin - Hocalara Ders Atama Sayfası
 * Admin girişi yapıldığında sistemdeki hocaları görüntüler ve onlara ders atar
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userService } from '@/services/api/user.service';
import { courseService } from '@/services/api/course.service';
import { sectionService } from '@/services/api/section.service';
import { departmentService } from '@/services/api/department.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { TextInput } from '@/components/common/TextInput';
import { Select } from '@/components/common/Select';
import { toast } from 'react-toastify';
import type { User, Course, Department } from '@/types/api.types';
import type { CreateSectionRequest } from '@/services/api/section.service';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import './AssignCourseToFacultyPage.css';

// Ders Düzenleme Modal İçeriği
const EditSectionModalContent: React.FC<{
  section: any;
  faculty: User;
  onClose: () => void;
  onUpdate: (data: { instructorId: string; capacity: number; courseId?: string }) => void;
  isLoading: boolean;
}> = ({ section, faculty, onClose, onUpdate, isLoading }) => {
  // Sadece bu hocaya atanmış dersleri getir
  const { data: facultySectionsData, isLoading: sectionsLoading } = useQuery(
    ['faculty-sections-for-edit', faculty.id],
    () => sectionService.getSections({ instructorId: faculty.id }),
    {
      enabled: !!faculty.id,
      retry: 1,
    }
  );

  const facultySections = facultySectionsData?.data || [];
  
  // Bu hocaya atanmış derslerin course ID'lerini topla (unique)
  const assignedCourseIds = new Set(
    facultySections.map((s: any) => s.courseId || s.course?.id).filter(Boolean)
  );

  // Tüm dersleri getir
  const { data: allCoursesData } = useQuery(
    'all-courses',
    () => courseService.getCourses({ page: 0, limit: 1000 }),
    { retry: 1 }
  );

  const allCourses = allCoursesData?.data?.content || [];
  
  // Sadece bu hocaya atanmış dersleri filtrele
  const assignedCourses = allCourses.filter((course: Course) => 
    assignedCourseIds.has(course.id.toString())
  );

  const [editCapacity, setEditCapacity] = useState(section.capacity || 40);
  const [editCourseId, setEditCourseId] = useState(section.courseId || section.course?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      instructorId: faculty.id,
      capacity: editCapacity,
      courseId: editCourseId || undefined,
    });
  };

  return (
    <div className="edit-section-form">
      <div className="edit-section-info">
        <p><strong>Bölüm:</strong> {section.sectionNumber}</p>
        <p><strong>Dönem:</strong> {section.semester} {section.year}</p>
      </div>
      <form onSubmit={handleSubmit}>
        {sectionsLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Select
              label="Ders *"
              value={editCourseId}
              onChange={(e) => setEditCourseId(e.target.value)}
              required
              options={[
                { value: '', label: 'Ders Seçiniz' },
                ...assignedCourses.map((course: any) => ({
                  value: course.id.toString(),
                  label: `${course.code} - ${course.name}`,
                })),
              ]}
            />
            <TextInput
              label="Kapasite"
              type="number"
              value={editCapacity}
              onChange={(e) => setEditCapacity(parseInt(e.target.value) || 40)}
              min={1}
              max={500}
            />
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
              >
                Kaydet
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

// Ders Düzenleme Form Component
const EditSectionForm: React.FC<{
  section: any;
  faculty: User;
  onClose: () => void;
  onUpdate: (data: { instructorId: string; capacity: number }) => void;
  isLoading: boolean;
}> = ({ section, faculty, onClose, onUpdate, isLoading }) => {
  // Sadece bu hocaya atanmış dersleri getir
  const { data: facultySectionsData, isLoading: sectionsLoading } = useQuery(
    ['faculty-sections-for-edit', faculty.id],
    () => sectionService.getSections({ instructorId: faculty.id }),
    {
      enabled: !!faculty.id,
      retry: 1,
    }
  );

  const facultySections = facultySectionsData?.data || [];
  
  // Section'lardan direkt course bilgilerini çıkar (backend'den courseCode ve courseName geliyor)
  // Eğer course objesi varsa onu kullan, yoksa courseCode ve courseName'den course oluştur
  const assignedCoursesMap = new Map<string | number, { id: string | number; code: string; name: string }>();
  
  facultySections.forEach((s: any) => {
    const courseId = s.courseId || s.course?.id;
    const courseCode = s.courseCode || s.course?.code;
    const courseName = s.courseName || s.course?.name;
    
    if (courseId && courseCode && courseName) {
      // Hem string hem number key olarak ekle
      assignedCoursesMap.set(courseId.toString(), { id: courseId, code: courseCode, name: courseName });
      assignedCoursesMap.set(Number(courseId), { id: courseId, code: courseCode, name: courseName });
    }
  });

  // Map'ten array'e çevir (unique courses)
  const assignedCourses = Array.from(assignedCoursesMap.values()).filter((course, index, self) => 
    index === self.findIndex(c => c.id.toString() === course.id.toString())
  );

  console.log('🔍 EditSectionForm - Faculty ID:', faculty.id);
  console.log('🔍 EditSectionForm - Faculty Sections:', facultySections.length);
  console.log('🔍 EditSectionForm - Assigned Courses:', assignedCourses.length, assignedCourses.map(c => `${c.code} - ${c.name}`));

  const [editCapacity, setEditCapacity] = useState(section.capacity || 40);
  const [editCourseId, setEditCourseId] = useState(section.courseId || section.course?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      instructorId: faculty.id,
      capacity: editCapacity,
    });
  };

  // Ders seçildiğinde sadece göster, güncelleme işleminde courseId gönderme
  // Çünkü backend'de section'ın courseId'si değiştirilemez (sadece instructorId ve capacity değiştirilebilir)

  return (
    <div className="edit-section-form">
      <div className="edit-section-info">
        <p><strong>Bölüm:</strong> {section.sectionNumber}</p>
        <p><strong>Dönem:</strong> {section.semester} {section.year}</p>
      </div>
      <form onSubmit={handleSubmit}>
        {sectionsLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Select
              label="Ders (Sadece bu hocaya atanmış dersler)"
              value={editCourseId}
              onChange={(e) => setEditCourseId(e.target.value)}
              required
              disabled={true}
              options={[
                { value: '', label: 'Ders Seçiniz' },
                ...assignedCourses.map((course: any) => ({
                  value: course.id.toString(),
                  label: `${course.code} - ${course.name}`,
                })),
              ]}
            />
            {assignedCourses.length === 0 && (
              <p className="text-muted" style={{ fontSize: '0.9rem', color: '#666', marginTop: '-10px', marginBottom: '10px' }}>
                Bu hocaya henüz ders atanmamış.
              </p>
            )}
            <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '-10px', marginBottom: '15px' }}>
              ℹ️ Ders bilgisi değiştirilemez. Sadece kapasite ve hoca değiştirilebilir.
            </p>
            <TextInput
              label="Kapasite"
              type="number"
              value={editCapacity}
              onChange={(e) => setEditCapacity(parseInt(e.target.value) || 40)}
              min={1}
              max={500}
            />
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
              >
                Güncelle
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

// Hocanın derslerini gösteren component
const FacultySectionsList: React.FC<{
  facultyId: string;
  onEdit: (section: any) => void;
  onDelete: (section: any) => void;
}> = ({ facultyId, onEdit, onDelete }) => {
  // Backend'de instructorUserId parametresi ile filtreleme yapılıyor
  // Ama backend filtreleme çalışmıyor gibi görünüyor (71 section dönüyor)
  // Client-side filtreleme yapıyoruz
  // Backend'den gelen section'larda instructorId Faculty ID olarak geliyor
  // User ID'den Faculty ID'yi bulmak için tüm hocaları getirip eşleştirme yapıyoruz
  
  // Tüm hocaları getir (Faculty ID'yi bulmak için)
  const { data: allFacultyData } = useQuery(
    ['all-faculty-for-filtering', facultyId],
    () => userService.getUsers({ role: 'FACULTY', page: 0, limit: 1000 }),
    { retry: 1 }
  );

  const allFaculty = allFacultyData?.data?.content || [];
  const currentFaculty = allFaculty.find((f: User) => f.id.toString() === facultyId.toString());
  
  // Backend'den Faculty ID'yi almak için backend API'sini kullanmamız gerekiyor
  // Ama şimdilik User ID'yi Faculty ID olarak kullanıyoruz (yanlış olabilir)
  // Backend'de getSectionsByInstructorUserId metodu User ID'den Faculty ID'yi buluyor
  // O yüzden backend'den gelen section'larda instructorId Faculty ID olarak geliyor
  // Frontend'de User ID'den Faculty ID'yi bulmak için backend'den Faculty bilgisini almak gerekiyor
  
  // Şimdilik backend filtrelemesinin çalışmasını bekliyoruz
  // Eğer backend filtreleme çalışmıyorsa, client-side filtreleme yapacağız
  // Ama User ID'den Faculty ID'yi bulmak için backend'den Faculty bilgisini almak gerekiyor
  
  const { data: sectionsData, isLoading, error } = useQuery(
    ['faculty-sections', facultyId],
    async () => {
      console.log('🔍 FacultySectionsList: Fetching sections for facultyId (User ID):', facultyId);
      
      // Backend'e instructorUserId parametresi gönderiliyor
      // Backend filtreleme çalışmıyor gibi görünüyor, o yüzden direkt endpoint kullanıyoruz
      const response = await sectionService.getSectionsByInstructorUserId(facultyId);
      
      // Backend'den gelen section'lar zaten filtrelenmiş olmalı
      const filteredSections = response?.data || [];
      
      console.log('✅ Backend\'den gelen filtrelenmiş section sayısı:', filteredSections.length);
      
      console.log('✅ FacultySectionsList: All sections:', allSections.length, 'Filtered sections:', filteredSections.length);
      if (filteredSections.length > 0) {
        console.log('🔍 FacultySectionsList: First section:', {
          id: filteredSections[0].id,
          courseCode: filteredSections[0].courseCode,
          instructorId: filteredSections[0].instructorId,
        });
      }
      
      return { ...response, data: filteredSections };
    },
    {
      enabled: !!facultyId,
      retry: 1,
      onError: (error) => {
        console.error('❌ FacultySectionsList: Error fetching sections:', error);
      },
    }
  );

  const sections = sectionsData?.data || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (sections.length === 0) {
    return (
      <div className="faculty-sections-empty">
        <p>Bu hocaya henüz ders atanmamış</p>
      </div>
    );
  }

  return (
    <div className="faculty-sections-list">
      <h4 className="sections-list-title">Atanmış Dersler</h4>
      {sections.map((section: any) => {
        // Backend'den courseCode ve courseName direkt geliyor, course objesi yok
        const courseCode = section.courseCode || section.course?.code || 'N/A';
        const courseName = section.courseName || section.course?.name || 'Ders Adı';
        return (
          <div key={section.id} className="faculty-section-item">
            <div className="section-item-info">
              <div className="section-course">
                <strong>{courseCode}</strong> - {courseName}
              </div>
              <div className="section-details-row">
                <span>Bölüm: {section.sectionNumber}</span>
                <span>Dönem: {section.semester} {section.year}</span>
                <span>Kapasite: {section.enrolledCount || 0} / {section.capacity || 0}</span>
              </div>
            </div>
            <div className="section-item-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(section)}
              >
                ✏️ Düzenle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(section)}
                className="delete-button"
              >
                🗑️ Kaldır
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const AssignCourseToFacultyPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedFaculty, setSelectedFaculty] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<CreateSectionRequest>({
    courseId: '',
    sectionNumber: '',
    semester: 'FALL',
    year: new Date().getFullYear(),
    instructorId: '',
    capacity: 40,
    scheduleJson: undefined,
    classroomId: undefined,
  });

  // Hocaları getir (FACULTY rolünde)
  const { data: facultyData, isLoading: facultyLoading } = useQuery(
    ['faculty-list', searchTerm, departmentFilter],
    async () => {
      const response = await userService.getUsers({
        role: 'FACULTY',
        search: searchTerm || undefined,
        page: 0,
        limit: 100,
      });
      return response;
    },
    { retry: 1 }
  );

  // Backend'den gelen response formatı: ApiResponse<PageResponse<UserResponse>>
  // PageResponse içinde: { content: User[], page, size, totalElements, totalPages }
  // Frontend'de beklenen format: { data: User[], pagination: {...} }
  const facultyList = facultyData?.data?.content || facultyData?.data?.data || [];

  // Silme mutation
  const deleteSectionMutation = useMutation(
    (sectionId: string | number) => sectionService.deleteSection(sectionId),
    {
      onSuccess: () => {
        toast.success('Ders ataması başarıyla kaldırıldı');
        setIsDeleteModalOpen(false);
        setSelectedSection(null);
        queryClient.invalidateQueries('faculty-list');
        queryClient.invalidateQueries(['faculty-sections', selectedFaculty?.id]);
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 'Ders ataması kaldırılırken bir hata oluştu';
        toast.error(errorMessage);
      },
    }
  );

  // Güncelleme mutation
  const updateSectionMutation = useMutation(
    ({ sectionId, data }: { sectionId: string | number; data: { instructorId?: number | string; capacity?: number } }) =>
      sectionService.updateSection(sectionId, data),
    {
      onSuccess: () => {
        toast.success('Ders ataması başarıyla güncellendi');
        setIsEditModalOpen(false);
        setSelectedSection(null);
        queryClient.invalidateQueries('faculty-list');
        queryClient.invalidateQueries(['faculty-sections', selectedFaculty?.id]);
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 'Ders ataması güncellenirken bir hata oluştu';
        toast.error(errorMessage);
      },
    }
  );

  // Bölümleri getir
  const { data: departmentsData } = useQuery(
    'departments',
    () => departmentService.getDepartments(),
    { retry: 1 }
  );

  // Dersleri getir
  const { data: coursesData, isLoading: coursesLoading } = useQuery(
    ['courses', formData.courseId ? null : 'all'],
    () => courseService.getCourses({ limit: 1000 }),
    { 
      retry: 1,
      enabled: isModalOpen, // Sadece modal açıkken yükle
    }
  );

  // Mevcut section kontrolü artık gerekli değil - bir ders için birden fazla hoca atanabilir

  // Section oluşturma mutation
  const createSectionMutation = useMutation(
    async (data: CreateSectionRequest) => {
      // Bir ders için birden fazla hoca atanabilir, bu yüzden her zaman yeni section oluştur
      // Sadece aynı ders, bölüm, dönem, yıl ve hoca kombinasyonu varsa uyarı ver
      return await sectionService.createSection(data);
    },
    {
      onSuccess: () => {
        toast.success('Ders başarıyla atandı!');
        setIsModalOpen(false);
        setSelectedFaculty(null);
        setFormData({
          courseId: '',
          sectionNumber: '',
          semester: 'FALL',
          year: new Date().getFullYear(),
          instructorId: '',
          capacity: 40,
          scheduleJson: undefined,
          classroomId: undefined,
        });
        queryClient.invalidateQueries('faculty-list');
        queryClient.invalidateQueries('existing-sections');
        queryClient.invalidateQueries(['faculty-sections', selectedFaculty?.id]);
      },
      onError: (error: any) => {
        let errorMessage = 'Ders atanırken bir hata oluştu';
        
        if (error?.response?.status === 404) {
          // 404 Not Found - Instructor bulunamadı
          const backendMessage = error?.response?.data?.message || '';
          if (backendMessage.includes('Instructor bulunamadı') || backendMessage.includes('Instructor not found')) {
            errorMessage = `⚠️ Hoca bulunamadı! Bu kullanıcı için Faculty kaydı veritabanında yok. Lütfen önce bu kullanıcıyı Faculty olarak kaydedin. Hata: ${backendMessage}`;
          } else {
            errorMessage = backendMessage || 'Kaynak bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.';
          }
        } else if (error?.response?.status === 409) {
          // 409 Conflict - Aynı ders, bölüm, dönem, yıl ve hoca kombinasyonu zaten mevcut
          const backendMessage = error?.response?.data?.message || '';
          if (backendMessage.includes('already exists') || backendMessage.includes('zaten mevcut')) {
            const selectedCourse = courses.find((c: Course) => c.id.toString() === formData.courseId);
            const courseName = selectedCourse ? `${selectedCourse.code} - ${selectedCourse.name}` : 'Seçilen ders';
            errorMessage = `${courseName} için ${formData.sectionNumber} numaralı bölüm ${formData.semester} ${formData.year} döneminde bu hoca zaten atanmış. Lütfen farklı bir bölüm numarası seçin veya farklı bir hoca seçin.`;
          } else {
            errorMessage = backendMessage || 'Bu ders bölümü için bu hoca zaten atanmış. Lütfen farklı bir bölüm numarası seçin.';
          }
        } else if (error?.response?.status === 500) {
          // 500 Internal Server Error
          const backendMessage = error?.response?.data?.message || '';
          errorMessage = backendMessage || 'Sunucu hatası oluştu. Lütfen sistem yöneticisine başvurun.';
          console.error('❌ Backend error:', error?.response?.data);
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage, { autoClose: 5000 });
      },
    }
  );

  const handleAssignCourse = (faculty: User) => {
    setSelectedFaculty(faculty);
    setFormData({
      courseId: '',
      sectionNumber: '',
      semester: 'FALL',
      year: new Date().getFullYear(),
      instructorId: faculty.id,
      capacity: 40,
      scheduleJson: undefined,
      classroomId: undefined,
    });
    setIsModalOpen(true);
  };

  const handleCourseChange = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      courseId,
    }));
  };

  const handleSemesterYearChange = (semester: string, year: number) => {
    setFormData((prev) => ({
      ...prev,
      semester,
      year,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courseId || !formData.semester || !formData.year) {
      toast.error('Lütfen ders, dönem ve yıl bilgilerini seçin');
      return;
    }

    if (!formData.sectionNumber) {
      toast.error('Lütfen bölüm numarası girin');
      return;
    }

    createSectionMutation.mutate(formData);
  };

  const departments = departmentsData?.data || [];
  const courses = coursesData?.data?.data || coursesData?.data?.content || [];

  // Bölüme göre filtreleme
  const filteredFaculty = departmentFilter
    ? facultyList.filter((faculty: User) => {
        const deptId = faculty.facultyInfo?.departmentId || faculty.departmentId;
        return deptId?.toString() === departmentFilter;
      })
    : facultyList;

  // Arama terimine göre filtreleme
  const searchedFaculty = searchTerm
    ? filteredFaculty.filter((faculty: User) => {
        const name = faculty.name || 
          [faculty.firstName, faculty.lastName].filter(Boolean).join(' ') ||
          faculty.email;
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               faculty.email?.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : filteredFaculty;

  if (facultyLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="assign-course-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Hocalara Ders Atama' },
        ]}
      />
      <PageHeader
        title="Hocalara Ders Atama"
        description="Sistemdeki hocaları görüntüleyin ve onlara ders atayın"
      />

      {/* Filtreler */}
      <Card variant="default" className="filters-card">
        <CardContent>
          <div className="filters-row">
            <TextInput
              label="Ara (İsim, Email)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Hoca ara..."
              className="search-input"
            />
            <Select
              label="Bölüm Filtresi"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              options={[
                { value: '', label: 'Tüm Bölümler' },
                ...departments.map((dept: Department) => ({
                  value: dept.id.toString(),
                  label: dept.name,
                })),
              ]}
              className="department-filter"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hocalar Listesi */}
      <div className="faculty-grid">
        {searchedFaculty.length === 0 ? (
          <Card variant="default">
            <CardContent>
              <div className="empty-state">
                {searchTerm || departmentFilter ? 'Arama kriterlerinize uygun hoca bulunamadı' : 'Sistemde hoca bulunamadı'}
              </div>
            </CardContent>
          </Card>
        ) : (
          searchedFaculty.map((faculty: User) => {
            const facultyName = faculty.name || 
              [faculty.firstName, faculty.lastName].filter(Boolean).join(' ') ||
              faculty.email ||
              'İsimsiz';
            const department = departments.find(
              (d: Department) => d.id.toString() === (faculty.facultyInfo?.departmentId || faculty.departmentId)?.toString()
            );

            return (
              <Card key={faculty.id} variant="elevated" className="faculty-card">
                <CardContent>
                  <div className="faculty-card-header">
                    <div className="faculty-avatar">
                      {faculty.profilePictureUrl || faculty.profilePicture ? (
                        <img
                          src={faculty.profilePictureUrl || faculty.profilePicture}
                          alt={facultyName}
                        />
                      ) : (
                        <div className="faculty-avatar-placeholder">
                          {facultyName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="faculty-info">
                      <h3 className="faculty-name">{facultyName}</h3>
                      <p className="faculty-email">{faculty.email}</p>
                      {faculty.facultyInfo?.title && (
                        <p className="faculty-title">{faculty.facultyInfo.title}</p>
                      )}
                      {department && (
                        <p className="faculty-department">{department.name}</p>
                      )}
                      {faculty.facultyInfo?.employeeNumber && (
                        <p className="faculty-employee-number">
                          Personel No: {faculty.facultyInfo.employeeNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="faculty-card-actions">
                    <Button
                      variant="primary"
                      onClick={() => handleAssignCourse(faculty)}
                      className="assign-button"
                    >
                      📚 Ders Ata
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setExpandedFaculty(expandedFaculty === faculty.id ? null : faculty.id);
                        setSelectedFaculty(faculty);
                      }}
                      className="view-courses-button"
                    >
                      {expandedFaculty === faculty.id ? '📖 Dersleri Gizle' : '📖 Dersleri Görüntüle'}
                    </Button>
                  </div>
                  
                  {/* Hocanın Atanmış Dersleri */}
                  {expandedFaculty === faculty.id && (
                    <FacultySectionsList
                      facultyId={faculty.id}
                      onEdit={(section) => {
                        setSelectedSection(section);
                        setSelectedFaculty(faculty);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={(section) => {
                        setSelectedSection(section);
                        setSelectedFaculty(faculty);
                        setIsDeleteModalOpen(true);
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Ders Atama Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFaculty(null);
        }}
        title={`Ders Ata - ${selectedFaculty?.name || [selectedFaculty?.firstName, selectedFaculty?.lastName].filter(Boolean).join(' ') || selectedFaculty?.email}`}
        size="large"
      >
        <form onSubmit={handleSubmit} className="assign-course-form">
          {coursesLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="form-info-message">
                <p>
                  ℹ️ <strong>Bilgi:</strong> Bir ders için birden fazla hoca atanabilir. Her hoca için ayrı bir bölüm oluşturulur.
                </p>
              </div>

              <Select
                label="Ders *"
                value={formData.courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                required
                options={[
                  { value: '', label: 'Ders Seçiniz' },
                  ...courses.map((course: Course) => ({
                    value: course.id.toString(),
                    label: `${course.code} - ${course.name}`,
                  })),
                ]}
              />

              <TextInput
                label="Bölüm Numarası *"
                value={formData.sectionNumber}
                onChange={(e) => setFormData({ ...formData, sectionNumber: e.target.value })}
                placeholder="Örn: A, B, 01, 02"
                required
              />

              <div className="form-row">
                <Select
                  label="Dönem *"
                  value={formData.semester}
                  onChange={(e) =>
                    handleSemesterYearChange(e.target.value, formData.year)
                  }
                  required
                  options={[
                    { value: 'FALL', label: 'Güz (FALL)' },
                    { value: 'SPRING', label: 'Bahar (SPRING)' },
                    { value: 'SUMMER', label: 'Yaz (SUMMER)' },
                  ]}
                />

                <TextInput
                  label="Yıl *"
                  type="number"
                  value={formData.year}
                  onChange={(e) => {
                    const year = parseInt(e.target.value) || new Date().getFullYear();
                    handleSemesterYearChange(formData.semester, year);
                  }}
                  required
                  min={2020}
                  max={2100}
                />
              </div>

              <TextInput
                label="Kapasite"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 40 })}
                min={1}
                max={500}
              />

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedFaculty(null);
                  }}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createSectionMutation.isLoading}
                >
                  Ders Ata
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Ders Ataması Düzenleme Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSection(null);
        }}
        title="Ders Atamasını Düzenle"
        size="md"
      >
        {selectedSection && selectedFaculty && (
          <EditSectionForm
            section={selectedSection}
            faculty={selectedFaculty}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedSection(null);
            }}
            onUpdate={(data) => {
              updateSectionMutation.mutate({
                sectionId: selectedSection.id,
                data,
              });
            }}
            isLoading={updateSectionMutation.isLoading}
          />
        )}
      </Modal>

      {/* Ders Ataması Silme Onay Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSection(null);
        }}
        onConfirm={() => {
          if (selectedSection) {
            deleteSectionMutation.mutate(selectedSection.id);
          }
        }}
        title="Ders Atamasını Kaldır"
        message={
          selectedSection
            ? `"${selectedSection.courseCode || selectedSection.course?.code || 'N/A'} - ${selectedSection.courseName || selectedSection.course?.name || 'Ders Adı'}" ders atamasını kaldırmak istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : 'Ders atamasını kaldırmak istediğinize emin misiniz?'
        }
        confirmText="Kaldır"
        cancelText="İptal"
        variant="danger"
        isLoading={deleteSectionMutation.isLoading}
      />
    </div>
  );
};

