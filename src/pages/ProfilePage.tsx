/**
 * Profile Page
 * Kullanıcı profil sayfası
 */

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import './ProfilePage.css';

const profileSchema = yup.object({
  name: yup.string().required('Ad Soyad gereklidir'),
  phone: yup.string().matches(/^[0-9+\s()-]+$/, 'Geçerli bir telefon numarası girin'),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name:
        user?.name ||
        [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim(),
      phone: user?.phone || user?.phoneNumber || '',
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    try {
      setIsUploading(true);
      const response = await userService.uploadProfilePicture(file);

      if (response.success && response.data) {
        await updateUser({
          profilePictureUrl: response.data.url,
          profilePicture: response.data.url,
        });
        toast.success('Profil fotoğrafı güncellendi');
      }
    } catch (error: any) {
      toast.error(error.message || 'Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateUser(data);
    } catch (error) {
      // Error handled in context
    }
  };

  // Profil tamamlanma yüzdesini hesapla
  const calculateProfileCompletion = () => {
    let completedFields = 0;
    const totalFields = 5;

    if (user?.name || (user?.firstName && user?.lastName)) completedFields++;
    if (user?.email) completedFields++;
    if (user?.phone || user?.phoneNumber) completedFields++;
    if (user?.profilePictureUrl || user?.profilePicture) completedFields++;
    if (user?.isVerified) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const isVerified = user?.isVerified ?? false;
  const roleDisplay = 
    user?.role === 'student' || user?.role === 'STUDENT' ? 'Öğrenci' :
    user?.role === 'faculty' || user?.role === 'FACULTY' ? 'Öğretim Üyesi' :
    user?.role === 'admin' || user?.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı';

  if (authLoading || !user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="profile-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Profil' },
        ]}
      />
      <PageHeader
        title="Profil Ayarları"
        description="Profil bilgilerinizi görüntüleyin ve güncelleyin"
      />

      {/* Bilgi Kartları */}
      <div className="profile-info-cards">
        <Card variant="elevated" className="profile-stat-card">
          <CardContent>
            <div className="profile-stat-icon profile-stat-icon-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="profile-stat-value">{profileCompletion}%</div>
            <div className="profile-stat-label">Profil Tamamlanma</div>
            <div className="profile-stat-description">Profil bilgilerinin tamamlanması</div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="profile-stat-card">
          <CardContent>
            <div className="profile-stat-icon profile-stat-icon-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="profile-stat-value">
              <Badge variant={isVerified ? 'success' : 'warning'} size="lg">
                {isVerified ? 'Aktif' : 'Beklemede'}
              </Badge>
            </div>
            <div className="profile-stat-label">Aktivite Durumu</div>
            <div className="profile-stat-description">
              {isVerified ? 'E-posta doğrulandı' : 'E-posta doğrulanmadı'}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="profile-stat-card">
          <CardContent>
            <div className="profile-stat-icon profile-stat-icon-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="profile-stat-value">
              <Badge variant="primary" size="lg">{roleDisplay}</Badge>
            </div>
            <div className="profile-stat-label">Rol</div>
            <div className="profile-stat-description">Sistem kullanıcısı</div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="profile-stat-card">
          <CardContent>
            <div className="profile-stat-icon profile-stat-icon-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="profile-stat-value">
              <Badge variant="success" size="lg">Online</Badge>
            </div>
            <div className="profile-stat-label">Platform Durumu</div>
            <div className="profile-stat-description">Tüm servisler çalışıyor</div>
          </CardContent>
        </Card>
      </div>

      <div className="profile-content">
        {/* Kullanıcı Profil Kartı */}
        <Card variant="elevated" className="profile-main-card">
          <CardHeader>
            <div className="profile-header-section">
              <div className="profile-picture-wrapper-large">
                {user.profilePictureUrl || user.profilePicture ? (
                  <img 
                    src={user.profilePictureUrl || user.profilePicture} 
                    alt={user.name || 'Profil'} 
                    className="profile-picture-large" 
                  />
                ) : (
                  <div className="profile-picture-placeholder-large">
                    {(user.name ||
                      [user.firstName, user.lastName].filter(Boolean).join(' ')).charAt(0).toUpperCase()}
                  </div>
                )}
                {!isVerified && (
                  <div className="profile-picture-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="profile-info-large">
                <h2 className="profile-name-large">
                  {user.name || [user.firstName, user.lastName].filter(Boolean).join(' ')}
                </h2>
                <p className="profile-email-large">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                  </svg>
                  {user.email}
                </p>
                <div className="profile-badges">
                  <Badge variant="primary">{roleDisplay}</Badge>
                  {!isVerified && <Badge variant="warning">Doğrulanmamış</Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="profile-details">
              {(user.role === 'student' || user.role === 'STUDENT') && user.studentInfo && (
                <>
                  <div className="profile-detail-item">
                    <span className="profile-detail-label">Öğrenci Numarası</span>
                    <span className="profile-detail-value">{user.studentInfo.studentNumber}</span>
                  </div>
                  {user.studentInfo.departmentName && (
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Bölüm</span>
                      <span className="profile-detail-value">{user.studentInfo.departmentName}</span>
                    </div>
                  )}
                </>
              )}
              {(user.role === 'faculty' || user.role === 'FACULTY') && user.facultyInfo && (
                <>
                  <div className="profile-detail-item">
                    <span className="profile-detail-label">Personel Numarası</span>
                    <span className="profile-detail-value">{user.facultyInfo.employeeNumber}</span>
                  </div>
                  {user.facultyInfo.departmentName && (
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Bölüm</span>
                      <span className="profile-detail-value">{user.facultyInfo.departmentName}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tamamlanan Özellikler */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
              </svg>
              Tamamlanan Özellikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon feature-icon-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L3 5V11C3 16.55 6.16 21.74 12 23C17.84 21.74 21 16.55 21 11V5L12 1ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="feature-content">
                  <div className="feature-title">Kullanıcı Kayıt ve Giriş Sistemi</div>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon feature-icon-success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="feature-content">
                  <div className="feature-title">Profil Yönetimi ve Fotoğraf Yükleme</div>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon feature-icon-info">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="feature-content">
                  <div className="feature-title">E-posta Doğrulama</div>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon feature-icon-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.14 11.06L21.16 9.48C21.34 9.34 21.4 9.09 21.3 8.87L19.3 5.13C19.21 4.92 19 4.8 18.78 4.84L16.31 5.23C15.86 4.68 15.32 4.2 14.7 3.81L14.3 1.35C14.26 1.13 14.08 0.97 13.85 0.97H10.15C9.92 0.97 9.74 1.13 9.7 1.35L9.3 3.81C8.68 4.2 8.14 4.68 7.69 5.23L5.22 4.84C5 4.8 4.79 4.92 4.7 5.13L2.7 8.87C2.6 9.09 2.66 9.34 2.84 9.48L4.86 11.06C4.82 11.36 4.8 11.67 4.8 12C4.8 12.33 4.82 12.64 4.86 12.94L2.84 14.52C2.66 14.66 2.6 14.91 2.7 15.13L4.7 18.87C4.79 19.08 5 19.2 5.22 19.16L7.69 18.77C8.14 19.32 8.68 19.8 9.3 20.19L9.7 22.65C9.74 22.87 9.92 23.03 10.15 23.03H13.85C14.08 23.03 14.26 22.87 14.3 22.65L14.7 20.19C15.32 19.8 15.86 19.32 16.31 18.77L18.78 19.16C19 19.2 19.21 19.08 19.3 18.87L21.3 15.13C21.4 14.91 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="feature-content">
                  <div className="feature-title">Rol Tabanlı Erişim Kontrolü</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profil Düzenleme Formu */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>

          <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
            <div className="profile-picture-section">
              <div className="profile-picture-wrapper">
                {user.profilePictureUrl || user.profilePicture ? (
                  <img 
                    src={user.profilePictureUrl || user.profilePicture} 
                    alt={user.name || 'Profil'} 
                    className="profile-picture" 
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    {(user.name ||
                      [user.firstName, user.lastName].filter(Boolean).join(' ')).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploading}
                >
                  {isUploading ? 'Yükleniyor...' : 'Fotoğraf Değiştir'}
                </Button>
                <p className="profile-picture-hint">Maksimum 5MB, JPG veya PNG</p>
              </div>
            </div>

            <TextInput
              label="Ad Soyad"
              error={errors.name?.message}
              fullWidth
              {...register('name')}
            />

            <TextInput
              label="Email"
              type="email"
              value={user.email}
              disabled
              fullWidth
              helperText="Email adresi değiştirilemez"
            />

            <TextInput
              label="Telefon"
              placeholder="+90 555 123 4567"
              error={errors.phone?.message}
              fullWidth
              {...register('phone')}
            />

            <div className="profile-info">
              <div className="profile-info-item">
                <span className="profile-info-label">Kullanıcı Tipi:</span>
                <span className="profile-info-value">{roleDisplay}</span>
              </div>
              {(user.role === 'student' || user.role === 'STUDENT') && user.studentInfo && (
                <div className="profile-info-item">
                  <span className="profile-info-label">Öğrenci No:</span>
                  <span className="profile-info-value">{user.studentInfo.studentNumber}</span>
                </div>
              )}
              {(user.role === 'faculty' || user.role === 'FACULTY') && user.facultyInfo && (
                <div className="profile-info-item">
                  <span className="profile-info-label">Personel No:</span>
                  <span className="profile-info-value">{user.facultyInfo.employeeNumber}</span>
                </div>
              )}
            </div>

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Değişiklikleri Kaydet
            </Button>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

