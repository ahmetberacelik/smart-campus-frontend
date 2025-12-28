/**
 * Dashboard Page
 * Ana sayfa - Role-based content with service grid layout (REBIS-inspired design)
 */

import React, { useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { attendanceService } from '@/services/api/attendance.service';
import { enrollmentService } from '@/services/api/enrollment.service';
import { sectionService } from '@/services/api/section.service';
import { mealService } from '@/services/api/meal.service';
import { format } from 'date-fns';
import './DashboardPage.css';

interface ServiceCard {
  id: string;
  title: string;
  icon: string;
  path: string;
  roles: string[];
  badge?: number;
  hasQuestionMark?: boolean;
}

export const DashboardPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Loading state kontrolü
  if (authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return (
      <div className="dashboard-page">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Kullanıcı bilgileri yüklenemedi</h2>
          <p>Lütfen sayfayı yenileyin veya tekrar giriş yapın.</p>
        </div>
      </div>
    );
  }

  const isStudent = user?.role?.toLowerCase() === 'student';
  const isFaculty = user?.role?.toLowerCase() === 'faculty';
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Student queries
  const { data: activeSessionsData } = useQuery(
    'dashboard-active-sessions',
    () => attendanceService.getActiveSessionsForStudent(),
    { enabled: isStudent, retry: 1 }
  );

  const { data: myCoursesData } = useQuery(
    'dashboard-my-courses',
    () => enrollmentService.getMyCourses(),
    { enabled: isStudent, retry: 1 }
  );

  // Faculty queries
  const currentYear = new Date().getFullYear();
  const currentSemester = new Date().getMonth() < 6 ? 'SPRING' : 'FALL';

  const { data: mySectionsData } = useQuery(
    ['dashboard-my-sections', currentSemester, currentYear],
    () => sectionService.getMySections(currentSemester, currentYear),
    { enabled: isFaculty, retry: 1 }
  );

  const { data: mySessionsData } = useQuery(
    'dashboard-my-sessions',
    () => attendanceService.getMySessions(),
    { enabled: isFaculty, retry: 1 }
  );

  // Meal menu query (for sidebar)
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: menuData } = useQuery(
    ['menu', today],
    () => mealService.getMenus({ date: today }),
    { enabled: isStudent, retry: 1 }
  );

  // Calculate stats for badges
  const activeSessionsCount = Array.isArray(activeSessionsData?.data) ? activeSessionsData.data.length : 0;
  const coursesCount = Array.isArray(myCoursesData?.data) ? myCoursesData.data.length : 0;
  const sectionsCount = Array.isArray(mySectionsData?.data) ? mySectionsData.data.length : 0;
  // Backend PageResponse döndürüyor, content içinde array var
  const mySessionsContent = (mySessionsData?.data as any)?.content || mySessionsData?.data || [];
  const activeSessionsCountFaculty = Array.isArray(mySessionsContent)
    ? mySessionsContent.filter((s: any) => s.status === 'ACTIVE' || s.status === 'Active').length
    : 0;

  // Service cards based on role
  const serviceCards: ServiceCard[] = useMemo(() => {
    const cards: ServiceCard[] = [];

    if (isStudent) {
      cards.push(
        {
          id: 'my-courses',
          title: 'Kayıtlı Derslerim',
          icon: '📚',
          path: '/my-courses',
          roles: ['student'],
          badge: coursesCount > 0 ? coursesCount : undefined,
        },
        {
          id: 'my-attendance',
          title: 'Yoklama Durumum',
          icon: '📝',
          path: '/my-attendance',
          roles: ['student'],
          badge: activeSessionsCount > 0 ? activeSessionsCount : undefined,
        },
        {
          id: 'grades',
          title: 'Notlarım',
          icon: '⭐',
          path: '/grades',
          roles: ['student'],
        },
        {
          id: 'courses',
          title: 'Dersler',
          icon: '📖',
          path: '/courses',
          roles: ['student'],
        },
        {
          id: 'schedule',
          title: 'Ders Programım',
          icon: '📅',
          path: '/schedule',
          roles: ['student'],
        },
        {
          id: 'menu',
          title: 'Yemek Menüsü',
          icon: '🍽️',
          path: '/meals/menu',
          roles: ['student'],
        },
        {
          id: 'reservations',
          title: 'Rezervasyonlarım',
          icon: '📋',
          path: '/meals/reservations',
          roles: ['student'],
        },
        {
          id: 'wallet',
          title: 'Cüzdan',
          icon: '💳',
          path: '/wallet',
          roles: ['student'],
        },
        {
          id: 'events',
          title: 'Etkinlikler',
          icon: '🎉',
          path: '/events',
          roles: ['student'],
        },
        {
          id: 'notifications',
          title: 'Bildirimler',
          icon: '🔔',
          path: '/notifications',
          roles: ['student'],
        },
        {
          id: 'profile',
          title: 'Profil',
          icon: '👤',
          path: '/profile',
          roles: ['student'],
        }
      );
    }

    if (isFaculty) {
      cards.push(
        {
          id: 'sections',
          title: 'Ders Bölümleri',
          icon: '📖',
          path: '/sections',
          roles: ['faculty'],
          badge: sectionsCount > 0 ? sectionsCount : undefined,
        },
        {
          id: 'start-attendance',
          title: 'Yoklama Başlat',
          icon: '🎯',
          path: '/attendance/start',
          roles: ['faculty'],
        },
        {
          id: 'my-sessions',
          title: 'Yoklama Oturumlarım',
          icon: '📊',
          path: '/attendance',
          roles: ['faculty'],
          badge: activeSessionsCountFaculty > 0 ? activeSessionsCountFaculty : undefined,
        },
        {
          id: 'excuse-requests',
          title: 'Mazeret İstekleri',
          icon: '📋',
          path: '/excuse-requests',
          roles: ['faculty'],
        },
        {
          id: 'schedule',
          title: 'Ders Programı',
          icon: '📅',
          path: '/schedule',
          roles: ['faculty'],
        },
        {
          id: 'notifications',
          title: 'Bildirimler',
          icon: '🔔',
          path: '/notifications',
          roles: ['faculty'],
        },
        {
          id: 'profile',
          title: 'Profil',
          icon: '👤',
          path: '/profile',
          roles: ['faculty'],
        }
      );
    }

    if (isAdmin) {
      cards.push(
        {
          id: 'analytics',
          title: 'Analytics Dashboard',
          icon: '📊',
          path: '/admin/analytics',
          roles: ['admin'],
        },
        {
          id: 'courses',
          title: 'Dersler',
          icon: '📚',
          path: '/courses',
          roles: ['admin'],
        },
        {
          id: 'sections',
          title: 'Ders Bölümleri',
          icon: '📖',
          path: '/sections',
          roles: ['admin'],
        },
        {
          id: 'assign-course',
          title: 'Ders Atama',
          icon: '👥',
          path: '/admin/assign-course',
          roles: ['admin'],
        },
        {
          id: 'profile',
          title: 'Profil',
          icon: '👤',
          path: '/profile',
          roles: ['admin'],
        }
      );
    }

    return cards;
  }, [isStudent, isFaculty, isAdmin, coursesCount, activeSessionsCount, sectionsCount, activeSessionsCountFaculty]);

  const userName = user?.name || (user?.firstName && user?.lastName
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    : user?.firstName || user?.lastName || 'Kullanıcı');

  // Parse menu items helper function
  const parseMenuItems = useCallback((menu: any) => {
    if (!menu) return [];
    if (Array.isArray(menu.items)) return menu.items;
    if (menu.itemsJson) {
      try {
        return typeof menu.itemsJson === 'string'
          ? JSON.parse(menu.itemsJson)
          : menu.itemsJson;
      } catch (e) {
        console.error('Error parsing menu items:', e);
        return [];
      }
    }
    return [];
  }, []);

  // Get today's menu items
  const todayMenu = Array.isArray(menuData?.data) ? menuData.data : [];
  const lunchMenu = todayMenu.find((m: any) => m.mealType === 'LUNCH');
  const dinnerMenu = todayMenu.find((m: any) => m.mealType === 'DINNER');

  const lunchItems = useMemo(() => parseMenuItems(lunchMenu), [lunchMenu, parseMenuItems]);
  const dinnerItems = useMemo(() => parseMenuItems(dinnerMenu), [dinnerMenu, parseMenuItems]);

  return (
    <div className="dashboard-page">
      {/* Welcome Header */}
      <div className="dashboard-welcome-header">
        <h1 className="dashboard-welcome-title">Hoş Geldiniz, {userName}!</h1>
      </div>

      <div className="dashboard-container">
        {/* Main Content - Service Grid */}
        <div className="dashboard-main">
          <div className="dashboard-grid">
            {serviceCards.map((service) => (
              <Link
                key={service.id}
                to={service.path}
                className="dashboard-service-card-link"
              >
                <Card variant="default" className="dashboard-service-card">
                  <CardContent className="dashboard-service-card-content">
                    <div className="dashboard-service-icon-wrapper">
                      <div className="dashboard-service-icon">{service.icon}</div>
                      {service.badge && service.badge > 0 && (
                        <Badge
                          variant="error"
                          className="dashboard-service-badge"
                        >
                          {service.badge}
                        </Badge>
                      )}
                      {service.hasQuestionMark && (
                        <div className="dashboard-service-question-mark">?</div>
                      )}
                    </div>
                    <div className="dashboard-service-title">{service.title}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        {isStudent && (
          <div className="dashboard-sidebar">
            <Card variant="default" className="dashboard-sidebar-card">
              <CardContent>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/meals/menu')}
                  className="dashboard-menu-button"
                >
                  GÜNÜN MENÜSÜ
                </Button>

                <div className="dashboard-sidebar-links">
                  <Link to="/wallet" className="dashboard-sidebar-link">
                    Para Yükleme
                  </Link>
                  <Link to="/meals/reservations" className="dashboard-sidebar-link">
                    Yemek Rezervasyonu Yap
                  </Link>
                </div>

                {(lunchMenu || dinnerMenu) && (
                  <div className="dashboard-menu-preview">
                    {lunchMenu && (
                      <div className="dashboard-menu-item">
                        <div className="dashboard-menu-label">ÖĞLE :</div>
                        <div className="dashboard-menu-items">
                          {lunchItems.length > 0 ? (
                            lunchItems.slice(0, 2).map((item: any, index: number) => (
                              <div key={index} className="dashboard-menu-item-name">
                                {item.name || item}
                              </div>
                            ))
                          ) : (
                            <div className="dashboard-menu-item-name">Menü yükleniyor...</div>
                          )}
                        </div>
                      </div>
                    )}
                    {dinnerMenu && (
                      <div className="dashboard-menu-item">
                        <div className="dashboard-menu-label">AKŞAM :</div>
                        <div className="dashboard-menu-items">
                          {dinnerItems.length > 0 ? (
                            dinnerItems.slice(0, 2).map((item: any, index: number) => (
                              <div key={index} className="dashboard-menu-item-name">
                                {item.name || item}
                              </div>
                            ))
                          ) : (
                            <div className="dashboard-menu-item-name">Menü yükleniyor...</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
