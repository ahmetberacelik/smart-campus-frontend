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
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import './AuthPages.css';

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Geçerli bir email adresi girin')
    .matches(/\.edu$/, 'Sadece .edu uzantılı üniversite email adresleri kabul edilir')
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

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
      setError(err.message || 'Giriş yapılırken bir hata oluştu');
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
          {error && <div className="auth-error">{error}</div>}

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

