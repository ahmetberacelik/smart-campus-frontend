/**
 * Email Verification Page
 * Email doğrulama sayfası
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/services/api';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import './AuthPages.css';

export const EmailVerificationPage: React.FC = () => {
  const { token: tokenFromPath } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get('token');
  const token = tokenFromPath || tokenFromQuery; // Path veya query parameter'dan token al
  
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Geçersiz doğrulama linki');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Email adresiniz başarıyla doğrulandı!');
        toast.success('Email doğrulandı');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Email doğrulanırken bir hata oluştu');
        toast.error('Email doğrulanamadı');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        {status === 'loading' && (
          <>
            <LoadingSpinner size="lg" />
            <p className="auth-subtitle">Email doğrulanıyor...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="auth-header">
              <h1 className="auth-title">✅ Email Doğrulandı</h1>
              <p className="auth-subtitle">{message}</p>
              <p className="auth-subtitle">Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
            <Link to="/login">
              <Button fullWidth>Giriş Sayfasına Git</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="auth-header">
              <h1 className="auth-title">❌ Doğrulama Hatası</h1>
              <p className="auth-subtitle">{message}</p>
            </div>
            <Link to="/login">
              <Button fullWidth>Giriş Sayfasına Dön</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

