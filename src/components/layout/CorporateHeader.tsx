/**
 * CorporateHeader Component
 * Kurumsal sticky header - Boğaziçi tarzı
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import './CorporateHeader.css';

export const CorporateHeader: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className={`corporate-header ${isScrolled ? 'corporate-header--scrolled' : ''}`}>
      <div className="corporate-header__container">
        <Link to="/dashboard" className="corporate-header__brand">
          <div className="corporate-header__logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
                className="corporate-header__logo-primary"
              />
              <path
                d="M2 17L12 22L22 17M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="corporate-header__logo-secondary"
              />
            </svg>
          </div>
          <div className="corporate-header__brand-text">
            <span className="corporate-header__brand-name">Akıllı</span>
            <span className="corporate-header__brand-accent">Kampüs</span>
          </div>
        </Link>

        {/* Right Side Actions */}
        <div className="corporate-header__actions">
          {/* Search Button */}
          <button
            className="corporate-header__search-btn"
            onClick={() => {
              // TODO: Open search modal
            }}
            aria-label="Ara"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Menu */}
          <div className="corporate-header__user-menu">
            <button
              className="corporate-header__user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="corporate-header__user-avatar">
                {user?.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt={user.name || 'User'} />
                ) : (
                  <div className="corporate-header__user-avatar-placeholder">
                    {(user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ')).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="corporate-header__user-name">
                {user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ')}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`corporate-header__user-chevron ${showUserMenu ? 'corporate-header__user-chevron--open' : ''}`}
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="corporate-header__user-dropdown">
                <Link
                  to="/profile"
                  className="corporate-header__user-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  Profil
                </Link>
                <button
                  className="corporate-header__user-dropdown-item corporate-header__user-dropdown-item--danger"
                  onClick={handleLogout}
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="corporate-header__mobile-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {showMobileMenu ? (
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

    </header>
  );
};

