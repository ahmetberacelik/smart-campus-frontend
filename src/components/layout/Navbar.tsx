/**
 * Navbar Component
 * Üst navigasyon çubuğu
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
          <div className="navbar-logo-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="navbar-logo">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#navbarGradient1)"/>
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="url(#navbarGradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="navbarGradient1" x1="2" y1="7" x2="22" y2="7" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#40e0d0"/>
                  <stop offset="1" stopColor="#2eb8a8"/>
                </linearGradient>
                <linearGradient id="navbarGradient2" x1="2" y1="14.5" x2="22" y2="14.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#40e0d0"/>
                  <stop offset="1" stopColor="#2eb8a8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="navbar-title-wrapper">
            <span className="navbar-title">Akıllı</span>
            <span className="navbar-title-accent">Kampüs</span>
          </div>
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

