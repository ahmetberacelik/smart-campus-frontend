/**
 * TextInput Component
 * Form input bileşeni
 */

import React from 'react';
import clsx from 'clsx';
import './TextInput.css';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, fullWidth = false, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className={clsx('text-input-wrapper', { 'full-width': fullWidth })}>
        {label && (
          <label htmlFor={props.id} className="text-input-label">
            {label}
            {props.required && <span className="required">*</span>}
          </label>
        )}
        <div className="text-input-container">
          {leftIcon && <span className="text-input-icon left">{leftIcon}</span>}
          <input
            ref={ref}
            className={clsx(
              'text-input',
              {
                'has-error': !!error,
                'has-left-icon': !!leftIcon,
                'has-right-icon': !!rightIcon,
              },
              className
            )}
            {...props}
          />
          {rightIcon && <span className="text-input-icon right">{rightIcon}</span>}
        </div>
        {error && <span className="text-input-error">{error}</span>}
        {helperText && !error && <span className="text-input-helper">{helperText}</span>}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

