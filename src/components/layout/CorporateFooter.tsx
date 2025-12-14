/**
 * CorporateFooter Component
 * Kurumsal footer bileşeni
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './CorporateFooter.css';

export const CorporateFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Ana Sayfa', to: '/dashboard' },
    { label: 'Dersler', to: '/courses' },
    { label: 'Profil', to: '/profile' },
  ];

  const contactInfo = {
    email: 'info@akillikampus.edu.tr',
    phone: '+90 (212) 123 45 67',
    address: 'Akıllı Kampüs, İstanbul, Türkiye',
  };

  return (
    <footer className="corporate-footer">
      <div className="corporate-footer__container">
        <div className="corporate-footer__content">
          {/* Brand Section */}
          <div className="corporate-footer__section">
            <div className="corporate-footer__brand">
              <div className="corporate-footer__logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    fill="currentColor"
                  />
                  <path
                    d="M2 17L12 22L22 17M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="corporate-footer__brand-text">
                <span className="corporate-footer__brand-name">Akıllı</span>
                <span className="corporate-footer__brand-accent">Kampüs</span>
              </div>
            </div>
            <p className="corporate-footer__description">
              Modern üniversite yönetim sistemi. Akademik işlemlerinizi kolayca yönetin.
            </p>
          </div>

          {/* Quick Links */}
          <div className="corporate-footer__section">
            <h3 className="corporate-footer__section-title">Hızlı Bağlantılar</h3>
            <ul className="corporate-footer__links">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="corporate-footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="corporate-footer__section">
            <h3 className="corporate-footer__section-title">İletişim</h3>
            <ul className="corporate-footer__contact">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                    fill="currentColor"
                  />
                </svg>
                <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
                    fill="currentColor"
                  />
                </svg>
                <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                    fill="currentColor"
                  />
                </svg>
                <span>{contactInfo.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="corporate-footer__bottom">
          <p className="corporate-footer__copyright">
            © {currentYear} Akıllı Kampüs. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

