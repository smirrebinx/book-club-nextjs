import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth-helpers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const count = await User.countDocuments({ isApproved: false });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
