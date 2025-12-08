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
  icon: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Ana Sayfa',
    icon: '🏠',
    roles: ['student', 'faculty', 'admin'],
  },
  {
    path: '/profile',
    label: 'Profil',
    icon: '👤',
    roles: ['student', 'faculty', 'admin'],
  },
  // Part 2, 3, 4 için diğer menü öğeleri eklenecek
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

