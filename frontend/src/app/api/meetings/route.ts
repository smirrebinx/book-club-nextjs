import { NextResponse } from 'next/server';

import { requireApproved, requireAdmin } from '@/lib/auth-helpers';
import connectDB from '@/lib/mongodb';
import Meeting from '@/models/Meeting';

import type { MeetingData } from '@/types/meeting';
import type { NextRequest } from 'next/server';

// GET /api/meetings - Get all meetings (approved users can view)
export async function GET() {
  try {
    await requireApproved();

    await connectDB();
    const meetings = await Meeting.find({}).sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch meetings',
      },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create a new meeting (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    await connectDB();

    const body: MeetingData = await request.json();

    // Validate required fields
    if (!body.id || !body.date || !body.time || !body.location || !body.book || !body.additionalInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const meeting = await Meeting.create(body);

    return NextResponse.json(
      {
        success: true,
        data: meeting,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating meeting:', error);

    // Handle duplicate key error
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'A meeting with this ID already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create meeting',
      },
      { status: 500 }
    );
  }
}
