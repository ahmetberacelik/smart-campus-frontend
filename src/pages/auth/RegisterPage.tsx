/**
 * Register Page
 * Kullanıcı kayıt sayfası
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/context/AuthContext';
import { departmentService } from '@/services/api';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { Select } from '@/components/common/Select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import './AuthPages.css';

const registerSchema = yup.object({
  name: yup.string().required('Ad Soyad gereklidir'),
  email: yup
    .string()
    .email('Geçerli bir email adresi girin')
    .matches(/\.edu$/, 'Sadece .edu uzantılı üniversite email adresleri kabul edilir')
    .required('Email gereklidir'),
  password: yup
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .matches(/[0-9]/, 'Şifre en az bir rakam içermelidir')
    .required('Şifre gereklidir'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı gereklidir'),
  role: yup.string().oneOf(['student', 'faculty']).required('Kullanıcı tipi seçiniz'),
  studentNumber: yup.string().when('role', {
    is: 'student',
    then: (schema) => schema.required('Öğrenci numarası gereklidir'),
    otherwise: (schema) => schema,
  }),
  employeeNumber: yup.string().when('role', {
    is: 'faculty',
    then: (schema) => schema.required('Personel numarası gereklidir'),
    otherwise: (schema) => schema,
  }),
  departmentId: yup.string().required('Bölüm seçiniz'),
  terms: yup.boolean().oneOf([true], 'Kullanım şartlarını kabul etmelisiniz'),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const selectedRole = watch('role');

  // Backend'den bölümleri çek
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const response = await departmentService.getDepartments();
        if (response.success && response.data) {
          const deptOptions = response.data.map((dept) => ({
            value: dept.id.toString(),
            label: `${dept.name} (${dept.code})`,
          }));
          setDepartments(deptOptions);
        } else {
          toast.error('Bölümler yüklenemedi');
        }
      } catch (error: any) {
        console.error('Bölümler yüklenirken hata:', error);
        toast.error('Bölümler yüklenirken bir hata oluştu');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      // Ad soyadı split et
      const parts = data.name.trim().split(' ');
      const firstName = parts.slice(0, -1).join(' ') || parts[0];
      const lastName = parts.slice(-1).join(' ') || '';

      await registerUser({
        email: data.email,
        password: data.password,
        firstName,
        lastName,
        role: data.role === 'student' ? 'STUDENT' : 'FACULTY',
        studentNumber: data.studentNumber,
        employeeNumber: data.employeeNumber,
        departmentId: data.departmentId,
      });
      
      navigate('/login', { state: { message: 'Kayıt başarılı! Lütfen email adresinizi doğrulayın.' } });
    } catch (err: any) {
      setError(err.message || 'Kayıt olurken bir hata oluştu');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">🏫 Akıllı Kampüs</h1>
          <p className="auth-subtitle">Yeni hesap oluşturun</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <TextInput
            label="Ad Soyad"
            placeholder="Adınız ve soyadınız"
            error={errors.name?.message}
            fullWidth
            {...register('name')}
          />

          <TextInput
            label="Email"
            type="email"
            placeholder="ornek@universite.edu.tr"
            error={errors.email?.message}
            fullWidth
            {...register('email')}
          />

          <Select
            label="Kullanıcı Tipi"
            options={[
              { value: '', label: 'Seçiniz...' },
              { value: 'student', label: 'Öğrenci' },
              { value: 'faculty', label: 'Öğretim Üyesi' },
            ]}
            error={errors.role?.message}
            fullWidth
            {...register('role')}
          />

          {selectedRole === 'student' && (
            <TextInput
              label="Öğrenci Numarası"
              placeholder="2021001"
              error={errors.studentNumber?.message}
              fullWidth
              {...register('studentNumber')}
            />
          )}

          {selectedRole === 'faculty' && (
            <TextInput
              label="Personel Numarası"
              placeholder="EMP001"
              error={errors.employeeNumber?.message}
              fullWidth
              {...register('employeeNumber')}
            />
          )}

          <Select
            label="Bölüm"
            options={loadingDepartments ? [{ value: '', label: 'Yükleniyor...' }] : departments}
            error={errors.departmentId?.message}
            fullWidth
            disabled={loadingDepartments}
            {...register('departmentId')}
          />

          <TextInput
            label="Şifre"
            type="password"
            placeholder="En az 8 karakter, büyük harf ve rakam içermeli"
            error={errors.password?.message}
            helperText="En az 8 karakter, bir büyük harf ve bir rakam içermelidir"
            fullWidth
            {...register('password')}
          />

          <TextInput
            label="Şifre Tekrar"
            type="password"
            placeholder="Şifrenizi tekrar girin"
            error={errors.confirmPassword?.message}
            fullWidth
            {...register('confirmPassword')}
          />

          <label className="auth-checkbox">
            <input type="checkbox" {...register('terms')} />
            <span>
              <a href="#" target="_blank" rel="noopener noreferrer">
                Kullanım şartlarını
              </a>{' '}
              kabul ediyorum
            </span>
          </label>
          {errors.terms && <div className="auth-error">{errors.terms.message}</div>}

          <Button type="submit" fullWidth isLoading={isLoading}>
            Kayıt Ol
          </Button>

          <div className="auth-footer">
            <span>Zaten hesabınız var mı?</span>
            <Link to="/login" className="auth-link">
              Giriş Yap
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

