/**
 * Login Page
 * Kullanıcı giriş sayfası
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/api';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { toast } from 'react-toastify';
import './AuthPages.css';

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Geçerli bir email adresi girin')
    .matches(/\.edu\.tr$/i, 'Sadece .edu.tr uzantılı üniversite email adresleri kabul edilir')
    .required('Email gereklidir'),
  password: yup.string().required('Şifre gereklidir'),
  rememberMe: yup.boolean(),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const email = watch('email');

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Lütfen email adresinizi girin');
      return;
    }

    try {
      setIsResendingEmail(true);
      await authService.resendVerificationEmail(email);
      toast.success('Doğrulama emaili gönderildi! Lütfen email adresinizi kontrol edin.');
    } catch (err: any) {
      toast.error(err.message || 'Email gönderilirken bir hata oluştu');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login({
        email: data.email,
        password: data.password,
      });
      
      // Redirect to intended page or dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage = err.message || 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
      
      // Email doğrulama hatası ise özel mesaj göster
      if (errorMessage.includes('doğrulanmamış') || err.response?.data?.error?.code === 'EMAIL_NOT_VERIFIED') {
        setError(
          'Email adresiniz doğrulanmamış. Lütfen email adresinizi kontrol edin ve doğrulama linkine tıklayın. Email gelmediyse aşağıdaki butona tıklayarak tekrar gönderebilirsiniz.'
        );
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">🏫 Akıllı Kampüs</h1>
          <p className="auth-subtitle">Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
              {error.includes('doğrulanmamış') && (
                <div style={{ marginTop: '10px' }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendVerification}
                    disabled={isResendingEmail || !email}
                    style={{ width: '100%' }}
                  >
                    {isResendingEmail ? 'Gönderiliyor...' : 'Doğrulama Emaili Tekrar Gönder'}
                  </Button>
                </div>
              )}
            </div>
          )}

          <TextInput
            label="Email"
            type="email"
            placeholder="ornek@universite.edu.tr"
            error={errors.email?.message}
            fullWidth
            {...register('email')}
          />

          <TextInput
            label="Şifre"
            type="password"
            placeholder="Şifrenizi girin"
            error={errors.password?.message}
            fullWidth
            {...register('password')}
          />

          <div className="auth-options">
            <label className="auth-checkbox">
              <input type="checkbox" {...register('rememberMe')} />
              <span>Beni hatırla</span>
            </label>
            <Link to="/forgot-password" className="auth-link">
              Şifremi unuttum
            </Link>
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            Giriş Yap
          </Button>

          <div className="auth-footer">
            <span>Hesabınız yok mu?</span>
            <Link to="/register" className="auth-link">
              Kayıt Ol
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

