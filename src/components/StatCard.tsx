import type { ReactNode } from "react";

export const STAT_VARIANTS = ["default", "primary", "success", "info"] as const;
export type StatVariant = (typeof STAT_VARIANTS)[number];

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  variant?: StatVariant;
}

export function StatCard({
  label,
  value,
  description,
  icon,
  variant = "default",
}: StatCardProps) {
  const variantStyles: Record<StatVariant, string> = {
    default: "bg-white border-gray-200",
    primary: "bg-[var(--statcard-bg)] border-[var(--statcard-bg)]",
    success: "bg-green-50 border-green-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textColorStyles: Record<StatVariant, string> = {
    default: "text-[var(--primary-text)]",
    primary: "text-[var(--statcard-text)]",
    success: "text-green-800",
    info: "text-blue-800",
  };

  const labelColorStyles: Record<StatVariant, string> = {
    default: "text-gray-600",
    primary: "text-[var(--statcard-text)]",
    success: "text-green-700",
    info: "text-blue-700",
  };

  if (variant === 'primary') {
    const whiteTextStyle = { color: 'var(--statcard-text)' };

    return (
      <div
        className={`rounded-lg border-2 p-4 sm:p-6 ${variantStyles[variant]} transition-all duration-300 hover:shadow-md`}
        role="group"
        aria-label={`${label}: ${value}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium mb-1" style={whiteTextStyle}>
              {label}
            </p>
            <p className="text-3xl sm:text-4xl font-bold mb-1" style={whiteTextStyle}>
              {value}
            </p>
            {description && (
              <p className="text-xs sm:text-sm mt-2" style={whiteTextStyle}>
                {description}
              </p>
            )}
          </div>

          {icon && (
            <div className="ml-4" aria-hidden="true" style={whiteTextStyle}>
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border-2 p-4 sm:p-6 ${variantStyles[variant]} transition-all duration-300 hover:shadow-md`}
      role="group"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${labelColorStyles[variant]}`}>
            {label}
          </p>
          <p className={`text-3xl sm:text-4xl font-bold mb-1 ${textColorStyles[variant]}`}>
            {value}
          </p>
          {description && (
            <p className="text-xs sm:text-sm mt-2 text-gray-500">
              {description}
            </p>
          )}
        </div>

        {icon && (
          <div className={`ml-4 ${textColorStyles[variant]}`} aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export function StatGrid({ children, columns = 3 }: StatGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6`}>{children}</div>;
}
