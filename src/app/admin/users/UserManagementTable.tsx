'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { approveUser, rejectUser, changeUserRole, deleteUser, forceLogoutUser } from '@/app/admin/actions';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

import { UserMobileCard } from './UserMobileCard';
import { UserTableRow } from './UserTableRow';

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
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; email: string } | null>(null);
  const [userToLogout, setUserToLogout] = useState<{ id: string; name: string; email: string } | null>(null);

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

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    startTransition(async () => {
      const result = await deleteUser(userToDelete.id);
      if (result.success) {
        showToast(result.message || 'Användare borttagen', 'success');
        setUserToDelete(null);
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
        setUserToDelete(null);
      }
    });
  };

  const handleForceLogout = async () => {
    if (!userToLogout) return;

    startTransition(async () => {
      const result = await forceLogoutUser(userToLogout.id);
      if (result.success) {
        showToast(result.message || 'Användare utloggad', 'success');
        setUserToLogout(null);
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
        setUserToLogout(null);
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
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <label htmlFor="user-search" className="sr-only">
              Sök efter namn eller e-post
            </label>
            <input
              id="user-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Sök efter namn eller e-post..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none"
              style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
            />
          </form>

          <div>
            <label htmlFor="role-filter" className="sr-only">
              Filtrera efter roll
            </label>
            <select
              id="role-filter"
              value={currentRole}
              onChange={(e) => updateFilters('role', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none"
              style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
            >
              <option value="">Alla roller</option>
              <option value="pending">Pending</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="sr-only">
              Filtrera efter status
            </label>
            <select
              id="status-filter"
              value={currentStatus}
              onChange={(e) => updateFilters('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none"
              style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
            >
              <option value="">Alla statusar</option>
              <option value="approved">Godkända</option>
              <option value="pending">Inväntar godkännande</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table - hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Användare
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registrerad
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Åtgärder
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <UserTableRow
                key={user._id}
                user={user}
                isPending={isPending}
                onRoleChange={(userId, role) => {
                  void handleRoleChange(userId, role);
                }}
                onApprove={(userId) => {
                  void handleApprove(userId);
                }}
                onReject={(userId) => {
                  void handleReject(userId);
                }}
                onDelete={(id, name, email) => setUserToDelete({ id, name, email })}
                onForceLogout={(id, name, email) => setUserToLogout({ id, name, email })}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout - visible only on mobile */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <UserMobileCard
            key={user._id}
            user={user}
            isPending={isPending}
            onRoleChange={(userId, role) => {
              void handleRoleChange(userId, role);
            }}
            onApprove={(userId) => {
              void handleApprove(userId);
            }}
            onReject={(userId) => {
              void handleReject(userId);
            }}
            onDelete={(id, name, email) => setUserToDelete({ id, name, email })}
            onForceLogout={(id, name, email) => setUserToLogout({ id, name, email })}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-gray-700">
            Visar {(pagination.page - 1) * pagination.limit + 1} till{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} av{' '}
            {pagination.total} användare
          </div>
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <button
                onClick={() => updateFilters('page', String(pagination.page - 1))}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-2 focus:outline-offset-2"
                style={{ outlineColor: 'var(--focus-ring)' }}
              >
                Föregående
              </button>
            )}
            {pagination.page < pagination.pages && (
              <button
                onClick={() => updateFilters('page', String(pagination.page + 1))}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-2 focus:outline-offset-2"
                style={{ outlineColor: 'var(--focus-ring)' }}
              >
                Nästa
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          void handleDeleteUser();
        }}
        title="Ta bort användare?"
        message={
          userToDelete
            ? `Är du säker på att du vill ta bort användaren ${userToDelete.name} (${userToDelete.email})? Denna åtgärd kan inte ångras.`
            : ''
        }
        confirmText="Ta bort"
        cancelText="Avbryt"
      />

      {/* Logout User Confirmation Modal */}
      <ConfirmModal
        isOpen={!!userToLogout}
        onClose={() => setUserToLogout(null)}
        onConfirm={() => {
          void handleForceLogout();
        }}
        title="Logga ut användare?"
        message={
          userToLogout
            ? `Användaren ${userToLogout.name} (${userToLogout.email}) kommer att loggas ut vid nästa sidladdning eller aktivitet.\n\nDetta kan användas för:\n• Systemuppdateringar - för att säkerställa att användare får den senaste versionen\n• Säkerhetsåtgärder - för att omedelbart återkalla åtkomst\n• Före borttagning - för att avsluta aktiva sessioner\n\nAnvändaren kan logga in igen om inte kontot raderas eller avvisas.`
            : ''
        }
        confirmText="Logga ut"
        cancelText="Avbryt"
      />
    </div>
  );
}
