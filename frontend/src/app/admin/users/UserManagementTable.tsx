'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { approveUser, rejectUser, changeUserRole } from '@/app/admin/actions';
import { useToast } from '@/components/Toast';

import type { UserRole } from '@/models/User';

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
  createdAt: string;
}

interface UserManagementTableProps {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  currentSearch: string;
  currentRole: string;
  currentStatus: string;
}

export function UserManagementTable({
  users,
  pagination,
  currentSearch,
  currentRole,
  currentStatus,
}: UserManagementTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(currentSearch);

  const handleApprove = async (userId: string) => {
    startTransition(async () => {
      const result = await approveUser(userId);
      if (result.success) {
        showToast(result.message || 'Användare godkänd', 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
    });
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Är du säker på att du vill avvisa denna användare?')) {
      return;
    }

    startTransition(async () => {
      const result = await rejectUser(userId);
      if (result.success) {
        showToast(result.message || 'Användare avvisad', 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
    });
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    startTransition(async () => {
      const result = await changeUserRole(userId, newRole);
      if (result.success) {
        showToast(result.message || 'Roll uppdaterad', 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
    });
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to page 1 when filtering
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', searchInput);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Sök efter namn eller e-post..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
            />
          </form>

          <select
            value={currentRole}
            onChange={(e) => updateFilters('role', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
          >
            <option value="">Alla roller</option>
            <option value="pending">Pending</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={currentStatus}
            onChange={(e) => updateFilters('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
          >
            <option value="">Alla statusar</option>
            <option value="approved">Godkända</option>
            <option value="pending">Väntande</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Användare
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registrerad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Åtgärder
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || 'Inget namn'}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => void handleRoleChange(user._id, e.target.value as UserRole)}
                    disabled={isPending}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
                  >
                    <option value="pending">Pending</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {user.isApproved ? 'Godkänd' : 'Väntande'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('sv-SE')}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  {!user.isApproved && (
                    <button
                      onClick={() => void handleApprove(user._id)}
                      disabled={isPending}
                      className="text-green-600 hover:text-green-900 font-medium disabled:opacity-50"
                    >
                      Godkänn
                    </button>
                  )}
                  {user.isApproved && user.role !== 'admin' && (
                    <button
                      onClick={() => void handleReject(user._id)}
                      disabled={isPending}
                      className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
                    >
                      Avvisa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Visar {(pagination.page - 1) * pagination.limit + 1} till{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} av{' '}
            {pagination.total} användare
          </div>
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <button
                onClick={() => updateFilters('page', String(pagination.page - 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Föregående
              </button>
            )}
            {pagination.page < pagination.pages && (
              <button
                onClick={() => updateFilters('page', String(pagination.page + 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Nästa
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
