/**
 * 404 Not Found Page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import './NotFoundPage.css';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Sayfa Bulunamadı</h2>
        <p className="not-found-description">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link to="/dashboard">
          <Button>Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  );
};

