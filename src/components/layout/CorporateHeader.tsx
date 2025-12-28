/**
 * CorporateHeader Component
 * Kurumsal sticky header - Boğaziçi tarzı
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import './CorporateHeader.css';

export const CorporateHeader: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
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
            <span className="corporate-header__brand-name">{t('header.brandName')}</span>
            <span className="corporate-header__brand-accent">{t('header.brandAccent')}</span>
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
            aria-label={t('common.search')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Theme Toggle Button */}
          <button
            className="corporate-header__theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('common.theme.switchToLight') : t('common.theme.switchToDark')}
            title={theme === 'dark' ? t('common.theme.switchToLight') : t('common.theme.switchToDark')}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V3M12 21V18M6 12H3M21 12H18M7.05 7.05L5.64 5.64M18.36 18.36L16.95 16.95M7.05 16.95L5.64 18.36M18.36 5.64L16.95 7.05M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Language Toggle Button */}
          <button
            className="corporate-header__language-toggle"
            onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
            aria-label={t('common.language.switchLanguage')}
            title={t('common.language.switchLanguage')}
          >
            <span className="corporate-header__language-code">
              {language.toUpperCase()}
            </span>
          </button>

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
                  {t('common.profile')}
                </Link>
                <button
                  className="corporate-header__user-dropdown-item corporate-header__user-dropdown-item--danger"
                  onClick={handleLogout}
                >
                  {t('common.logout')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="corporate-header__mobile-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label={t('common.menu')}
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

