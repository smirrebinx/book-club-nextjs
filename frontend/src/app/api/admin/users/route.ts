import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

import type { NextRequest} from 'next/server';

interface UserQuery {
  $or?: Array<{
    name?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
  }>;
  role?: string;
  isApproved?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const statusFilter = searchParams.get('status') || '';

    await connectDB();

    // Build query
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
      .select('name email role isApproved createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Kunde inte hämta användare' }, { status: 500 });
  }
}
