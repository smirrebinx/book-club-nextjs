import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Meeting from '@/models/Meeting';
import { MeetingData } from '@/types/meeting';

// GET /api/meetings - Get all meetings
export async function GET() {
  try {
    await connectDB();
    const meetings = await Meeting.find({}).sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch meetings',
      },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request: NextRequest) {
  try {
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
  } catch (error: any) {
    console.error('Error creating meeting:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
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
