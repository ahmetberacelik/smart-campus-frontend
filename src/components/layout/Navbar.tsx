/**
 * Navbar Component
 * Üst navigasyon çubuğu
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../common/Button';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="navbar-logo">🏫</span>
          <span className="navbar-title">Akıllı Kampüs</span>
        </Link>

        <div className="navbar-menu">
          <div className="navbar-user">
            <div className="navbar-user-info">
              <span className="navbar-user-name">
                {user?.name ||
                  [user?.firstName, user?.lastName].filter(Boolean).join(' ')}
              </span>
              <span className="navbar-user-role">
                {['student', 'STUDENT'].includes(user?.role || '') && 'Öğrenci'}
                {['faculty', 'FACULTY'].includes(user?.role || '') && 'Öğretim Üyesi'}
                {['admin', 'ADMIN'].includes(user?.role || '') && 'Yönetici'}
              </span>
            </div>
            <div className="navbar-user-avatar">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className={`navbar-dropdown ${showMenu ? 'show' : ''}`}>
              <button
                className="navbar-dropdown-toggle"
                onClick={() => setShowMenu(!showMenu)}
              >
                ▼
              </button>
              {showMenu && (
                <div className="navbar-dropdown-menu">
                  <Link to="/profile" onClick={() => setShowMenu(false)}>
                    Profil
                  </Link>
                  <button onClick={handleLogout}>Çıkış Yap</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

