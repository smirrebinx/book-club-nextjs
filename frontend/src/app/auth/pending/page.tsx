import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

import { PendingContent } from './PendingContent';

export default async function PendingPage() {
  const session = await auth();

  // If not logged in, redirect to signin
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // If already approved, redirect to home
  if (session.user.isApproved) {
    redirect('/');
  }

  return <PendingContent email={session.user.email || ''} />;
}
