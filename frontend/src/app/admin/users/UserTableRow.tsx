'use client';


import { ActionButton } from '@/components/ActionButton';
import { StatusBadge } from '@/components/StatusBadge';

import type { UserRole } from '@/models/User';

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
  createdAt: string;
}

interface UserTableRowProps {
  user: User;
  isPending: boolean;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  onDelete: (userId: string, name: string, email: string) => void;
  onForceLogout: (userId: string, name: string, email: string) => void;
}

export function UserTableRow({
  user,
  isPending,
  onRoleChange,
  onApprove,
  onReject,
  onDelete,
  onForceLogout,
}: UserTableRowProps) {
  return (
    <tr>
      <td className="px-2 sm:px-4 md:px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {user.name || 'Inget namn'}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-4">
        <label htmlFor={`role-${user._id}`} className="sr-only">
          Ändra roll för {user.name || user.email}
        </label>
        <select
          id={`role-${user._id}`}
          value={user.role}
          onChange={(e) => {
            onRoleChange(user._id, e.target.value as UserRole);
          }}
          disabled={isPending}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none"
          style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
        >
          <option value="pending">Pending</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-4">
        <StatusBadge variant={user.isApproved ? 'success' : 'warning'}>
          {user.isApproved ? 'Godkänd' : 'Väntande'}
        </StatusBadge>
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-4 text-sm text-gray-500">
        {new Date(user.createdAt).toLocaleDateString('sv-SE')}
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-4 text-sm">
        <div className="flex flex-wrap gap-2">
          {!user.isApproved && (
            <>
              <ActionButton
                variant="success"
                size="sm"
                onClick={() => {
                  onApprove(user._id);
                }}
                disabled={isPending}
              >
                Godkänn
              </ActionButton>
              <ActionButton
                variant="danger"
                size="sm"
                onClick={() => {
                  onReject(user._id);
                }}
                disabled={isPending}
              >
                Avvisa
              </ActionButton>
            </>
          )}
          {user.role !== 'admin' && (
            <>
              <ActionButton
                variant="warning"
                size="sm"
                onClick={() => onForceLogout(user._id, user.name, user.email)}
                disabled={isPending}
              >
                Logga ut
              </ActionButton>
              <ActionButton
                variant="danger"
                size="sm"
                onClick={() => onDelete(user._id, user.name, user.email)}
                disabled={isPending}
              >
                Ta bort
              </ActionButton>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
