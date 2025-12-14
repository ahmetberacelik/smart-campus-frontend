/**
 * Table Component
 * Kurumsal tablo bileşeni
 */

import React from 'react';
import clsx from 'clsx';
import './Table.css';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  stickyHeader?: boolean;
}

export const Table: React.FC<TableProps> = ({ children, className, stickyHeader = false }) => {
  return (
    <div className={clsx('corporate-table-wrapper', { 'corporate-table-wrapper--sticky': stickyHeader })}>
      <table className={clsx('corporate-table', className)}>{children}</table>
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={clsx('corporate-table__header', className)}>{children}</thead>;
};

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={clsx('corporate-table__body', className)}>{children}</tbody>;
};

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, onClick }) => {
  return (
    <tr className={clsx('corporate-table__row', { 'corporate-table__row--clickable': onClick }, className)} onClick={onClick}>
      {children}
    </tr>
  );
};

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className, align = 'left' }) => {
  return (
    <th className={clsx('corporate-table__head', `corporate-table__head--${align}`, className)}>
      {children}
    </th>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({ children, className, align = 'left' }) => {
  return (
    <td className={clsx('corporate-table__cell', `corporate-table__cell--${align}`, className)}>
      {children}
    </td>
  );
};

