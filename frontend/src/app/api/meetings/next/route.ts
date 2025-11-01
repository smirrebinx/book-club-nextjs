import { NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Meeting from '@/models/Meeting';

// GET /api/meetings/next - Get the next upcoming meeting
export async function GET() {
  try {
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
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch next meeting',
      },
      { status: 500 }
    );
  }
}
