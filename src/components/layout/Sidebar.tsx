/**
 * Sidebar Component
 * Yan menü - Role-based navigation
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './Sidebar.css';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Genel',
    items: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
          </svg>
        ),
        roles: ['student', 'faculty', 'admin'],
      },
      {
        path: '/profile',
        label: 'Profil',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
          </svg>
        ),
        roles: ['student', 'faculty', 'admin'],
      },
    ],
  },
  {
    label: 'Akademik Yönetim',
    items: [
      {
        path: '/courses',
        label: 'Dersler',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H7V10H17V12ZM15 16H7V14H15V16ZM17 8H7V6H17V8Z" fill="currentColor"/>
          </svg>
        ),
        roles: ['student', 'faculty', 'admin'],
      },
      {
        path: '/my-courses',
        label: 'Kayıtlı Derslerim',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        roles: ['student'],
      },
      {
        path: '/grades',
        label: 'Notlarım',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
        ),
        roles: ['student'],
      },
      {
        path: '/sections',
        label: 'Ders Bölümleri',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20V8H4V6ZM4 11H20V13H4V11ZM4 16H20V18H4V16Z" fill="currentColor"/>
          </svg>
        ),
        roles: ['faculty', 'admin'],
      },
    ],
  },
  {
    label: 'GPS Yoklama',
    items: [
      {
        path: '/my-attendance',
        label: 'Yoklama Durumum',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
          </svg>
        ),
        roles: ['student'],
      },
      {
        path: '/attendance/start',
        label: 'Yoklama Başlat',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
          </svg>
        ),
        roles: ['faculty'],
      },
      {
        path: '/excuse-requests',
        label: 'Mazeret İstekleri',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
          </svg>
        ),
        roles: ['faculty'],
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getRoleDisplay = () => {
    if (!user) return '';
    const role = user.role?.toLowerCase();
    if (role === 'student' || role === 'STUDENT') return 'Öğrenci';
    if (role === 'faculty' || role === 'FACULTY') return 'Öğretim Üyesi';
    if (role === 'admin' || role === 'ADMIN') return 'Yönetici';
    return 'Kullanıcı';
  };

  const isVerified = user?.isVerified ?? false;

  return (
    <aside className="sidebar">
      {/* User Profile Section */}
      <div className="sidebar-profile">
        <div className="sidebar-profile-header">
          <div className="sidebar-profile-avatar">
            {user?.profilePictureUrl || user?.profilePicture ? (
              <img 
                src={user.profilePictureUrl || user.profilePicture} 
                alt={user.name || 'Profil'} 
              />
            ) : (
              <div className="sidebar-profile-avatar-placeholder">
                {(user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ')).charAt(0).toUpperCase()}
              </div>
            )}
            {!isVerified && (
              <div className="sidebar-profile-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                </svg>
              </div>
            )}
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">
              {user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Kullanıcı'}
            </div>
            <div className="sidebar-profile-role">{getRoleDisplay()}</div>
          </div>
        </div>
        {!isVerified && (
          <div className="sidebar-profile-warning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
            </svg>
            <span>E-posta doğrulanmadı</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section, sectionIndex) => {
          const filteredItems = section.items.filter((item) => {
            if (!item.roles) return true;
            if (!user) return false;
            const role = user.role?.toLowerCase();
            return item.roles.some((r) => r.toLowerCase() === role);
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={sectionIndex} className="sidebar-nav-section">
              <div className="sidebar-nav-label">{section.label}</div>
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">{item.label}</span>
                    {isActive && <div className="sidebar-item-indicator" />}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

