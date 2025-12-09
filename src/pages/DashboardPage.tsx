/**
 * Dashboard Page
 * Ana sayfa - Role-based content
 */

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'student':
      case 'STUDENT':
        return 'Öğrenci Paneli';
      case 'faculty':
      case 'FACULTY':
        return 'Öğretim Üyesi Paneli';
      case 'admin':
      case 'ADMIN':
        return 'Yönetici Paneli';
      default:
        return 'Hoş Geldiniz';
    }
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'student':
        return 'Derslerinizi görüntüleyin, yoklama verin ve notlarınızı takip edin.';
      case 'faculty':
        return 'Derslerinizi yönetin, yoklama alın ve not girişi yapın.';
      case 'admin':
        return 'Sistem yönetimi ve raporlama işlemlerini gerçekleştirin.';
      default:
        return '';
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Hoş Geldiniz,{' '}
          {user?.name ||
            [user?.firstName, user?.lastName].filter(Boolean).join(' ')}! 👋
        </h1>
        <p className="dashboard-subtitle">{getRoleDescription()}</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="dashboard-card-icon">📚</div>
          <h2 className="dashboard-card-title">{getRoleTitle()}</h2>
          <p className="dashboard-card-description">
            Part 1 tamamlandı! Part 2'de akademik yönetim ve GPS yoklama özellikleri eklenecek.
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-icon">👤</div>
            <h3 className="dashboard-card-title">Profil</h3>
            <p className="dashboard-card-description">
              Profil bilgilerinizi görüntüleyin ve güncelleyin.
            </p>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">🔐</div>
            <h3 className="dashboard-card-title">Güvenlik</h3>
            <p className="dashboard-card-description">
              Şifrenizi değiştirin ve güvenlik ayarlarınızı yönetin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

