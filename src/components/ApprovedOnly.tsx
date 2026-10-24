import { auth } from '@/lib/auth';

interface ApprovedOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Server component that only renders children if user is approved
 * Use this for conditional rendering of approved user features
 */
export default async function ApprovedOnly({ children, fallback = null }: ApprovedOnlyProps) {
  const session = await auth();

  if (!session?.user?.isApproved) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
