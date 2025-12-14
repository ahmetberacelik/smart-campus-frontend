/**
 * Badge Component
 * Durum rozeti bileşeni
 */

import React from 'react';
import clsx from 'clsx';
import './Badge.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  return (
    <span
      className={clsx(
        'corporate-badge',
        `corporate-badge--${variant}`,
        `corporate-badge--${size}`,
        className
      )}
    >
      {children}
    </span>
  );
};

