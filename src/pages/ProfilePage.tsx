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

  if (authLoading || !user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-title">Profil Ayarları</h1>
        <p className="profile-subtitle">Profil bilgilerinizi görüntüleyin ve güncelleyin</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <h2 className="profile-card-title">Profil Bilgileri</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
            <div className="profile-picture-section">
              <div className="profile-picture-wrapper">
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt={user.name} className="profile-picture" />
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
                <span className="profile-info-value">
                  {user.role === 'student' && 'Öğrenci'}
                  {user.role === 'faculty' && 'Öğretim Üyesi'}
                  {user.role === 'admin' && 'Yönetici'}
                </span>
              </div>
              {user.role === 'student' && 'studentNumber' in user && (
                <div className="profile-info-item">
                  <span className="profile-info-label">Öğrenci No:</span>
                  <span className="profile-info-value">{user.studentNumber}</span>
                </div>
              )}
              {user.role === 'faculty' && 'employeeNumber' in user && (
                <div className="profile-info-item">
                  <span className="profile-info-label">Personel No:</span>
                  <span className="profile-info-value">{user.employeeNumber}</span>
                </div>
              )}
            </div>

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Değişiklikleri Kaydet
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

