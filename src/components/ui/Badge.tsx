/**
 * Badge Component
 * Durum rozeti bileşeni
 */

import React from 'react';
import clsx from 'clsx';
import './Badge.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  style,
}) => {
  return (
    <span
      className={clsx(
        'corporate-badge',
        `corporate-badge--${variant}`,
        `corporate-badge--${size}`,
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
};


