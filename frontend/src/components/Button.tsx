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
      bg-[var(--primary-bg)]
      text-white
      hover:bg-white
      hover:text-[var(--primary-bg)]
      border-2
      border-[var(--primary-bg)]
      disabled:hover:bg-[var(--primary-bg)]
      disabled:hover:text-white
    `,
    secondary: `
      bg-[var(--secondary-bg)]
      text-white
      hover:bg-white
      hover:text-[var(--secondary-bg)]
      border-2
      border-[var(--secondary-bg)]
      disabled:hover:bg-[var(--secondary-bg)]
      disabled:hover:text-white
    `,
    outline: `
      border-2
      border-[var(--primary-border)]
      bg-white
      text-[var(--primary-text)]
      hover:bg-[var(--primary-bg)]
      hover:text-white
      disabled:hover:bg-white
      disabled:hover:text-[var(--primary-text)]
    `,
    ghost: `
      bg-transparent
      text-[var(--primary-text)]
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
