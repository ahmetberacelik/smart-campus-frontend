/**
 * Select Component
 * Dropdown select bileşeni
 */

import React from 'react';
import clsx from 'clsx';
import './Select.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, fullWidth = false, placeholder, className, ...props }, ref) => {
    return (
      <div className={clsx('select-wrapper', { 'full-width': fullWidth })}>
        {label && (
          <label htmlFor={props.id} className="select-label">
            {label}
            {props.required && <span className="required">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={clsx('select', { 'has-error': !!error }, className)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="select-error">{error}</span>}
        {helperText && !error && <span className="select-helper">{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

