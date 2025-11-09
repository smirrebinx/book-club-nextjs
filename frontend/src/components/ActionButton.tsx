import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ActionButtonVariant = 'success' | 'danger';
type ActionButtonSize = 'sm' | 'md' | 'lg';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ActionButtonVariant;
  size?: ActionButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

/**
 * ActionButton - Specialized button for approve/reject admin actions
 * Uses WCAG AA compliant green/red colors from CSS variables
 */
export function ActionButton({
  variant,
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ActionButtonProps) {
  const baseStyles = 'font-medium rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-offset-2';

  const variantStyles = {
    success: `
      bg-[var(--action-success-bg)]
      text-white
      hover:bg-white
      hover:text-[var(--action-success)]
      border-2
      border-[var(--action-success-bg)]
      disabled:hover:bg-[var(--action-success-bg)]
      disabled:hover:text-white
    `,
    danger: `
      bg-[var(--action-danger-bg)]
      text-white
      hover:bg-white
      hover:text-[var(--action-danger)]
      border-2
      border-[var(--action-danger-bg)]
      disabled:hover:bg-[var(--action-danger-bg)]
      disabled:hover:text-white
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthStyles = fullWidth ? 'flex-1' : '';

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

/**
 * ActionLink - Text-only link variant for desktop table actions
 */
interface ActionLinkProps {
  variant: ActionButtonVariant;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ActionLink({
  variant,
  children,
  onClick,
  disabled = false,
  className = '',
}: ActionLinkProps) {
  const variantStyles = {
    success: 'text-[var(--action-success)] hover:text-[var(--action-success-hover)] transition-colors duration-300',
    danger: 'text-[var(--action-danger)] hover:text-[var(--action-danger-hover)] transition-colors duration-300',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-medium disabled:opacity-50 ${variantStyles[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
