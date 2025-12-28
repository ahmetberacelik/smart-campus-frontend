/**
 * Sidebar Component
 * Yan menü - Role-based navigation
 */

import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
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

const getNavSections = (t: (key: string) => string): NavSection[] => [
  {
    label: t('sidebar.sections.general'),
    items: [
      {
        path: '/dashboard',
        label: t('sidebar.nav.dashboard'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student', 'faculty', 'admin'],
      },
      {
        path: '/profile',
        label: t('sidebar.nav.profile'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student', 'faculty', 'admin'],
      },
    ],
  },
  {
    label: t('sidebar.sections.academic'),
    items: [
      {
        path: '/courses',
        label: t('sidebar.nav.courses'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H7V10H17V12ZM15 16H7V14H15V16ZM17 8H7V6H17V8Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student', 'admin'], // faculty için kaldırıldı
      },
      {
        path: '/my-courses',
        label: t('sidebar.nav.myCourses'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        roles: ['student'],
      },
      {
        path: '/grades',
        label: t('sidebar.nav.grades'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student'],
      },
      {
        path: '/sections',
        label: t('sidebar.nav.sections'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20V8H4V6ZM4 11H20V13H4V11ZM4 16H20V18H4V16Z" fill="currentColor" />
          </svg>
        ),
        roles: ['faculty', 'admin'],
      },
    ],
  },
  {
    label: t('sidebar.sections.attendance'),
    items: [
      {
        path: '/my-attendance',
        label: t('sidebar.nav.myAttendance'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student'],
      },
      {
        path: '/attendance/start',
        label: t('sidebar.nav.startAttendance'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
          </svg>
        ),
        roles: ['faculty'],
      },
      {
        path: '/excuse-requests',
        label: t('sidebar.nav.excuseRequests'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" />
          </svg>
        ),
        roles: ['faculty'],
      },
    ],
  },
  {
    label: t('sidebar.sections.meals'),
    items: [
      {
        path: '/meals/menu',
        label: t('sidebar.nav.mealMenu'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.1 13.34L11 16.24L15.9 11.34L19.17 14.61C20.33 13.45 21 11.95 21 10.5C21 7.46 18.54 5 15.5 5C14.05 5 12.55 5.67 11.39 6.83L8.1 10.12V13.34ZM5.63 18.37L9.17 14.83L11 16.66L7.66 20H4V16.34L5.63 18.37ZM4 3H7.66L11 6.34L9.17 8.17L5.63 4.63L4 6.76V3ZM18.37 5.63L14.83 9.17L13 7.34L16.34 4H20V7.66L18.37 5.63Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student'],
      },
      {
        path: '/meals/reservations',
        label: t('sidebar.nav.myReservations'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H17V12H7V10ZM7 14H14V16H7V14Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student'],
      },
      {
        path: '/meals/scan',
        label: t('sidebar.nav.qrScanner'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.5 6.5V9.5H6.5V6.5H9.5ZM11 5H5V11H11V5ZM9.5 14.5V17.5H6.5V14.5H9.5ZM11 13H5V19H11V13ZM17.5 6.5V9.5H14.5V6.5H17.5ZM19 5H13V11H19V5ZM13 13H15V15H13V13ZM15 15H17V17H15V15ZM17 17H19V19H17V17ZM17 13H19V15H17V13ZM19 17H21V19H19V17ZM13 17H15V19H13V17ZM15 19H17V21H15V19ZM6.5 14.5H9.5V17.5H6.5V14.5ZM17.5 14.5H20.5V17.5H17.5V14.5Z" fill="currentColor" />
          </svg>
        ),
        roles: ['staff', 'admin'],
      },
      {
        path: '/wallet',
        label: t('sidebar.nav.wallet'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student'],
      },
    ],
  },
  {
    label: t('sidebar.sections.events'),
    items: [
      {
        path: '/events',
        label: t('sidebar.nav.events'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H17V13H7V11ZM7 15H12V17H7V15Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student', 'faculty', 'admin'],
      },
      {
        path: '/my-events',
        label: t('sidebar.nav.myEvents'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H17V13H7V11ZM7 15H14V17H7V15Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student'],
      },
      {
        path: '/events/checkin',
        label: t('sidebar.nav.eventCheckIn'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor" />
          </svg>
        ),
        roles: ['faculty', 'admin'],
      },
    ],
  },
  {
    label: t('sidebar.sections.schedule'),
    items: [
      {
        path: '/schedule',
        label: t('sidebar.nav.mySchedule'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student'],
      },
      {
        path: '/admin/scheduling/generate',
        label: t('sidebar.nav.generateSchedule'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
          </svg>
        ),
        roles: ['admin'],
      },
      {
        path: '/reservations',
        label: t('sidebar.nav.classroomReservations'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 7V3H2V21H22V7H12ZM6 19H4V17H6V19ZM6 15H4V13H6V15ZM6 11H4V9H6V11ZM6 7H4V5H6V7ZM10 19H8V17H10V19ZM10 15H8V13H10V15ZM10 11H8V9H10V11ZM10 7H8V5H10V7ZM20 19H12V17H14V15H12V13H14V11H12V9H20V19ZM18 11H16V13H18V11ZM18 15H16V17H18V15Z" fill="currentColor" />
          </svg>
        ),
        // Öğrencilerin de derslik rezervasyonu yapabilmesi için yeniden 'student' rolünü ekliyoruz
        roles: ['student', 'faculty', 'admin'],
      },
    ],
  },
  {
    label: t('sidebar.sections.management'),
    items: [
      {
        path: '/notifications',
        label: t('sidebar.nav.notifications'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor" />
          </svg>
        ),
        roles: ['student', 'faculty', 'admin'],
      },
      {
        path: '/admin/analytics',
        label: t('sidebar.nav.analytics'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor" />
          </svg>
        ),
        roles: ['admin'],
      },
      {
        path: '/admin/assign-courses',
        label: t('sidebar.nav.assignCourses'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
          </svg>
        ),
        roles: ['admin'],
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const navSections = useMemo(() => getNavSections(t), [t]);

  const getRoleDisplay = () => {
    if (!user) return '';
    const role = user.role?.toLowerCase();
    if (role === 'student' || role === 'STUDENT') return t('sidebar.roles.student');
    if (role === 'faculty' || role === 'FACULTY') return t('sidebar.roles.faculty');
    if (role === 'admin' || role === 'ADMIN') return t('sidebar.roles.admin');
    return t('sidebar.roles.user');
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
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">
              {user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || t('sidebar.roles.user')}
            </div>
            <div className="sidebar-profile-role">{getRoleDisplay()}</div>
          </div>
        </div>
        {!isVerified && (
          <div className="sidebar-profile-warning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" />
            </svg>
            <span>{t('sidebar.profile.emailNotVerified')}</span>
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

