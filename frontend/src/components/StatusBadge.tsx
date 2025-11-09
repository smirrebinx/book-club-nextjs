import type { ReactNode } from 'react';

type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children: ReactNode;
  className?: string;
}

/**
 * StatusBadge - Component for displaying status indicators
 * Used for approval status, user roles, etc.
 */
export function StatusBadge({ variant, children, className = '' }: StatusBadgeProps) {
  const baseStyles = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';

  const variantStyles = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}
