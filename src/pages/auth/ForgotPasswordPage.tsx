/**
 * Forgot Password Page
 * Şifre sıfırlama isteği sayfası
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '@/services/api';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { toast } from 'react-toastify';
import './AuthPages.css';

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Geçerli bir email adresi girin')
    .matches(/\.edu$/, 'Sadece .edu uzantılı üniversite email adresleri kabul edilir')
    .required('Email gereklidir'),

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
      toast.success('Şifre sıfırlama linki email adresinize gönderildi');
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1 className="auth-title">✅ Email Gönderildi</h1>
            <p className="auth-subtitle">
              Şifre sıfırlama linki email adresinize gönderildi. Lütfen email kutunuzu kontrol edin.
            </p>
          </div>
          <Link to="/login">
            <Button fullWidth>Giriş Sayfasına Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">🔐 Şifremi Unuttum</h1>
          <p className="auth-subtitle">
            Email adresinizi girin, size şifre sıfırlama linki gönderelim
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <TextInput
            label="Email"
            type="email"
            placeholder="ornek@universite.edu.tr"
            error={errors.email?.message}
            fullWidth
            {...register('email')}
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Şifre Sıfırlama Linki Gönder
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

