import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth-helpers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Administration
            </h2>
            <nav className="space-y-2">
              <Link
                href="/admin/users"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Användare
              </Link>
              <Link
                href="/admin/suggestions"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Bokförslag
              </Link>
              <Link
                href="/admin/meetings"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Möten
              </Link>
              <Link
                href="/"
                className="block px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mt-4"
              >
                ← Tillbaka till hemsidan
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
