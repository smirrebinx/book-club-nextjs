import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

/**
 * Button - General purpose button component
 * Uses custom brand colors from CSS variables (--primary-bg, --secondary-bg)
 */
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-offset-2';

  const variantStyles = {
    primary: `
      bg-[var(--button-primary-bg)]
      text-[var(--button-primary-text)]
      hover:bg-[var(--button-primary-hover)]
      border-2
      border-[var(--button-primary-bg)]
      hover:border-[var(--button-primary-hover)]
      disabled:hover:bg-[var(--button-primary-bg)]
      disabled:hover:border-[var(--button-primary-bg)]
    `,
    secondary: `
      bg-[var(--button-secondary-bg)]
      text-[var(--button-secondary-text)]
      hover:bg-[var(--button-secondary-hover-bg)]
      hover:text-[var(--button-secondary-hover-text)]
      border-2
      border-[var(--button-secondary-border)]
      hover:border-[var(--button-secondary-hover-bg)]
      disabled:hover:bg-[var(--button-secondary-bg)]
      disabled:hover:text-[var(--button-secondary-text)]
      disabled:hover:border-[var(--button-secondary-border)]
    `,
    outline: `
      border-2
      border-[var(--button-secondary-border)]
      bg-white
      text-[var(--button-secondary-text)]
      hover:bg-[var(--button-secondary-hover-bg)]
      hover:text-[var(--button-secondary-hover-text)]
      hover:border-[var(--button-secondary-hover-bg)]
      disabled:hover:bg-white
      disabled:hover:text-[var(--button-secondary-text)]
      disabled:hover:border-[var(--button-secondary-border)]
    `,
    ghost: `
      bg-transparent
      text-[var(--button-secondary-text)]
      hover:bg-gray-100
      border-2
      border-transparent
      disabled:hover:bg-transparent
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`.trim()}
      style={{ outlineColor: 'var(--focus-ring)' }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
