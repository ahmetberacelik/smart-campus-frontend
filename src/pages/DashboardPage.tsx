/**
 * Dashboard Page
 * Ana sayfa - Role-based content
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

  const userName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Hoş Geldiniz, ${userName}!`}
        description={getRoleDescription()}
      />

      <div className="dashboard-content">
        <Card variant="elevated" className="dashboard-hero-card">
          <CardHeader>
            <CardTitle>{getRoleTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="dashboard-hero-description">
              Part 1 tamamlandı! Part 2'de akademik yönetim ve GPS yoklama özellikleri eklenecek.
            </p>
          </CardContent>
        </Card>

        <div className="dashboard-grid">
          <Link to="/profile" className="dashboard-card-link">
            <Card variant="default" className="dashboard-feature-card">
              <CardContent>
                <div className="dashboard-feature-icon">👤</div>
                <h3 className="dashboard-feature-title">Profil</h3>
                <p className="dashboard-feature-description">
                  Profil bilgilerinizi görüntüleyin ve güncelleyin.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card variant="default" className="dashboard-feature-card">
            <CardContent>
              <div className="dashboard-feature-icon">🔐</div>
              <h3 className="dashboard-feature-title">Güvenlik</h3>
              <p className="dashboard-feature-description">
                Şifrenizi değiştirin ve güvenlik ayarlarınızı yönetin.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

