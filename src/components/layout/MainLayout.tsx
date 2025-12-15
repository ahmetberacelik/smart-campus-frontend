/**
 * MainLayout Component
 * Ana layout wrapper - Header + Sidebar + Content + Footer
 */

import React from 'react';
import { CorporateHeader } from './CorporateHeader';
import { Sidebar } from './Sidebar';
import { CorporateFooter } from './CorporateFooter';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="main-layout">
      <CorporateHeader />
      <div className="main-layout__body">
        <Sidebar />
        <main className="main-layout__content">
          <div className="main-layout__container">
            {children}
          </div>
        </main>
      </div>
      <CorporateFooter />
    </div>
  );
};

