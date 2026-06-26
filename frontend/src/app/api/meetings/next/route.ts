import { NextResponse } from 'next/server';

import { requireApproved } from '@/lib/auth-helpers';
import { toSafeErrorMessage, UserFacingError } from '@/lib/errors';
import connectDB from '@/lib/mongodb';
import Meeting from '@/models/Meeting';

// GET /api/meetings/next - Get the next upcoming meeting (approved users can view)
export async function GET() {
  try {
    await requireApproved();

    await connectDB();

    // For now, we'll just get the most recently created meeting
    // In the future, you might want to add proper date parsing and comparison
    const meeting = await Meeting.findOne({}).sort({ createdAt: -1 });

    if (!meeting) {
      return NextResponse.json(
        {
          success: false,
          error: 'No upcoming meetings found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: toSafeErrorMessage(error, 'Failed to fetch next meeting') },
      { status: error instanceof UserFacingError ? 403 : 500 }
    );
  }
}
