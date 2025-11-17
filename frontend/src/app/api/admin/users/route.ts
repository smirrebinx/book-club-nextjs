import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth-helpers';
import connectDB from '@/lib/mongodb';
import { createRateLimitMiddleware } from '@/lib/rateLimit';
import User from '@/models/User';

import type { NextRequest} from 'next/server';

const rateLimitMiddleware = createRateLimitMiddleware({
  limit: 100,
  windowMs: 60000 // 100 requests per minute
});

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
    // Apply rate limiting
    const rateLimit = rateLimitMiddleware(request.headers);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'För många förfrågningar. Försök igen senare.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          }
        }
      );
    }

    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.min(parseInt(searchParams.get('page') || '1'), 10000);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const statusFilter = searchParams.get('status') || '';

    await connectDB();

    // Build query
    const query: UserQuery = {};

    if (search) {
      // Escape special regex characters to prevent NoSQL injection
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
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
