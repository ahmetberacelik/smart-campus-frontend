/**
 * MainLayout Component
 * Ana layout wrapper - Header + Content + Footer
 */

import React from 'react';
import { CorporateHeader } from './CorporateHeader';
import { CorporateFooter } from './CorporateFooter';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="main-layout">
      <CorporateHeader />
      <main className="main-layout__content">
        <div className="main-layout__container">
          {children}
        </div>
      </main>
      <CorporateFooter />
    </div>
  );
};

