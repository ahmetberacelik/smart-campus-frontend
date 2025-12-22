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
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'textarea';
  rows?: number;
}

export const TextInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, TextInputProps>(
  ({ label, error, helperText, fullWidth = false, leftIcon, rightIcon, className, type = 'text', rows, ...props }, ref) => {
    const isTextarea = type === 'textarea';

    return (
      <div className={clsx('text-input-wrapper', { 'full-width': fullWidth })}>
        {label && (
          <label htmlFor={props.id} className="text-input-label">
            {label}
            {props.required && <span className="required">*</span>}
          </label>
        )}
        <div className="text-input-container">
          {leftIcon && !isTextarea && <span className="text-input-icon left">{leftIcon}</span>}
          {isTextarea ? (
            <textarea
              ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
              rows={rows || 4}
              className={clsx(
                'text-input',
                'text-input-textarea',
                {
                  'has-error': !!error,
                },
                className
              )}
              {...(props as any)}
              value={props.value}
              onChange={props.onChange}
            />
          ) : (
            <input
              ref={ref as React.ForwardedRef<HTMLInputElement>}
              type={type}
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
          )}
          {rightIcon && !isTextarea && <span className="text-input-icon right">{rightIcon}</span>}
        </div>
        {error && <span className="text-input-error">{error}</span>}
        {helperText && !error && <span className="text-input-helper">{helperText}</span>}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

