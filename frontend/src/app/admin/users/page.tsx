import { Suspense } from 'react';

import LoadingSkeleton from '@/components/LoadingSkeleton';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

import { UserManagementTable } from './UserManagementTable';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connectDB();

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 20;
  const search = (params.search as string) || '';
  const roleFilter = (params.role as string) || '';
  const statusFilter = (params.status as string) || '';

  // Build query
  interface UserQuery {
    $or?: Array<{ name?: { $regex: string; $options: string }; email?: { $regex: string; $options: string } }>;
    role?: string;
    isApproved?: boolean;
  }
  const query: UserQuery = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (roleFilter) {
    query.role = roleFilter;
  }

  if (statusFilter === 'approved') {
    query.isApproved = true;
  } else if (statusFilter === 'pending') {
    query.isApproved = false;
  }

  // Get total count
  const total = await User.countDocuments(query);

  // Get paginated users
  const users = await User.find(query)
    .select('name email role isApproved createdAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean();

  // Convert to plain objects
  const usersData = users.map((user) => ({
    _id: user._id.toString(),
    name: user.name || '',
    email: user.email,
    role: user.role,
    isApproved: user.isApproved,
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
  }));

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Användarhantering</h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">
          Godkänn, avvisa och hantera användarroller
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton variant="table" rows={10} />}>
        <UserManagementTable
          users={usersData}
          pagination={pagination}
          currentSearch={search}
          currentRole={roleFilter}
          currentStatus={statusFilter}
        />
      </Suspense>
    </div>
  );
}
