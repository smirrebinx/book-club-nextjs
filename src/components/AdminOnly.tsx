import { auth } from '@/lib/auth';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Server component that only renders children if user is admin
 * Use this for conditional rendering of admin-only UI elements
 */
export default async function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
