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
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      // Backend'den gelen hata mesajını al
      const backendError = err.response?.data?.error || err.response?.data;
      const errorCode = backendError?.code || err.code;
      let errorMessage = backendError?.message || err.message || 'Giriş yapılırken bir hata oluştu';
      
      // 401 Unauthorized için özel mesajlar
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Backend'den gelen spesifik mesajları kontrol et
        const errorMessageLower = errorMessage.toLowerCase();
        
        if (errorCode === 'EMAIL_NOT_VERIFIED' || errorMessageLower.includes('doğrulanmamış') || errorMessageLower.includes('not verified')) {
          setError(
            'Email adresiniz doğrulanmamış. Lütfen email adresinizi kontrol edin ve doğrulama linkine tıklayın. Email gelmediyse aşağıdaki butona tıklayarak tekrar gönderebilirsiniz.'
          );
        } else if (errorMessageLower.includes('yanlış') || errorMessageLower.includes('hatalı') || 
                   errorMessageLower.includes('invalid') || errorMessageLower.includes('incorrect') ||
                   errorMessageLower.includes('bad credentials') || errorMessageLower.includes('wrong password')) {
          setError('Email veya şifre hatalı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
        } else if (errorMessageLower.includes('user not found') || errorMessageLower.includes('kullanıcı bulunamadı')) {
          setError('Bu email adresi ile kayıtlı bir kullanıcı bulunamadı. Lütfen email adresinizi kontrol edin veya kayıt olun.');
        } else {
          // Genel 401 hatası
          setError(`Giriş başarısız. ${errorMessage || 'Email veya şifre hatalı olabilir. Lütfen bilgilerinizi kontrol edip tekrar deneyin.'}`);
        }
      } else if (err.response?.status === 500) {
        setError('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin veya sistem yöneticisi ile iletişime geçin.');
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#gradient1)"/>
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="url(#gradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient1" x1="2" y1="7" x2="22" y2="7" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#40e0d0"/>
                  <stop offset="1" stopColor="#2eb8a8"/>
                </linearGradient>
                <linearGradient id="gradient2" x1="2" y1="14.5" x2="22" y2="14.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#40e0d0"/>
                  <stop offset="1" stopColor="#2eb8a8"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="auth-title-text">
              <span className="auth-title-text-main">Akıllı</span>
              <span className="auth-title-text-accent">Kampüs</span>
            </span>
          </h1>
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
            placeholder="ornek@email.com"
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

