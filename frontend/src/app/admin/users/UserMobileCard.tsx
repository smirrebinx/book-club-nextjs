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

interface UserMobileCardProps {
  user: User;
  isPending: boolean;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  onDelete: (userId: string, name: string, email: string) => void;
  onForceLogout: (userId: string, name: string, email: string) => void;
}

export function UserMobileCard({
  user,
  isPending,
  onRoleChange,
  onApprove,
  onReject,
  onDelete,
  onForceLogout,
}: UserMobileCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* User Info */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Användare</div>
        <div className="text-sm font-medium text-gray-900">
          {user.name || 'Inget namn'}
        </div>
        <div className="text-sm text-gray-500">{user.email}</div>
      </div>

      {/* Roll */}
      <div className="mb-3">
        <label htmlFor={`role-mobile-${user._id}`} className="text-xs font-medium text-gray-500 uppercase mb-1 block">
          Roll
        </label>
        <select
          id={`role-mobile-${user._id}`}
          value={user.role}
          onChange={(e) => {
            onRoleChange(user._id, e.target.value as UserRole);
          }}
          disabled={isPending}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none"
          style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
        >
          <option value="pending">Pending</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Status */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Status</div>
        <StatusBadge variant={user.isApproved ? 'success' : 'warning'}>
          {user.isApproved ? 'Godkänd' : 'Väntande'}
        </StatusBadge>
      </div>

      {/* Registrerad */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Registrerad</div>
        <div className="text-sm text-gray-500">
          {new Date(user.createdAt).toLocaleDateString('sv-SE')}
        </div>
      </div>

      {/* Actions */}
      {(!user.isApproved || user.role !== 'admin') && (
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase mb-2">Åtgärder</div>
          <div className="flex flex-col gap-2">
            {!user.isApproved && (
              <div className="flex gap-2">
                <ActionButton
                  variant="success"
                  onClick={() => {
                    onApprove(user._id);
                  }}
                  disabled={isPending}
                  fullWidth
                >
                  Godkänn
                </ActionButton>
                <ActionButton
                  variant="danger"
                  onClick={() => {
                    onReject(user._id);
                  }}
                  disabled={isPending}
                  fullWidth
                >
                  Avvisa
                </ActionButton>
              </div>
            )}
            {user.role !== 'admin' && (
              <>
                <ActionButton
                  variant="warning"
                  onClick={() => onForceLogout(user._id, user.name, user.email)}
                  disabled={isPending}
                  fullWidth
                >
                  Logga ut användare
                </ActionButton>
                <ActionButton
                  variant="danger"
                  onClick={() => onDelete(user._id, user.name, user.email)}
                  disabled={isPending}
                  fullWidth
                >
                  Ta bort användare
                </ActionButton>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
