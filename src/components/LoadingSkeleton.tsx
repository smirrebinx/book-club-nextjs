interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'table';
  rows?: number;
}

export default function LoadingSkeleton({
  className = '',
  variant = 'text',
  rows = 1
}: LoadingSkeletonProps) {
  if (variant === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100" />
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-16 border-t border-gray-200 bg-gray-50" />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
