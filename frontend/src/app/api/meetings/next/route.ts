import { NextResponse } from 'next/server';

import { requireApproved } from '@/lib/auth-helpers';
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
    console.error('Error fetching next meeting:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch next meeting',
      },
      { status: 500 }
    );
  }
}
