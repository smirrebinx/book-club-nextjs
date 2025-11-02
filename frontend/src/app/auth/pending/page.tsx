import { redirect } from 'next/navigation';

import { auth, signOut } from '@/lib/auth';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Ditt konto väntar på godkännande
        </h1>

        <p className="text-gray-600 mb-6">
          Ditt konto med e-postadressen <strong>{session.user.email}</strong> är registrerat
          men väntar på godkännande från en administratör.
        </p>

        <p className="text-gray-500 text-sm mb-8">
          Du kommer att få tillgång till webbplatsen så snart en administratör har granskat
          och godkänt din begäran.
        </p>

        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/auth/signin' });
          }}
        >
          <button
            type="submit"
            className="w-full bg-[#94b1aa] hover:bg-[#568b7f] text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Logga ut
          </button>
        </form>
      </div>
    </div>
  );
}
