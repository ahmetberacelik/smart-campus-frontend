/**
 * Reset Password Page
 * Şifre sıfırlama sayfası
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '@/services/api';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { toast } from 'react-toastify';
import './AuthPages.css';

const resetPasswordSchema = yup.object({
  newPassword: yup
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .matches(/[0-9]/, 'Şifre en az bir rakam içermelidir')
    .required('Şifre gereklidir'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı gereklidir'),
});

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      toast.error('Geçersiz token');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    try {
      setIsLoading(true);
      await authService.resetPassword(token, data.newPassword);
      setIsSuccess(true);
      toast.success('Şifreniz başarıyla güncellendi');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Şifre sıfırlanırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1 className="auth-title">✅ Şifre Güncellendi</h1>
            <p className="auth-subtitle">
              Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">🔐 Yeni Şifre Belirle</h1>
          <p className="auth-subtitle">Yeni şifrenizi belirleyin</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <TextInput
            label="Yeni Şifre"
            type="password"
            placeholder="En az 8 karakter, büyük harf ve rakam içermeli"
            error={errors.newPassword?.message}
            helperText="En az 8 karakter, bir büyük harf ve bir rakam içermelidir"
            fullWidth
            {...register('newPassword')}
          />

          <TextInput
            label="Şifre Tekrar"
            type="password"
            placeholder="Yeni şifrenizi tekrar girin"
            error={errors.confirmPassword?.message}
            fullWidth
            {...register('confirmPassword')}
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Şifreyi Güncelle
          </Button>

          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              ← Giriş sayfasına dön
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

