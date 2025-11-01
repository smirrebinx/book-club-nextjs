import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Meeting from '@/models/Meeting';
import { MeetingData } from '@/types/meeting';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/meetings/[id] - Get a specific meeting by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const meeting = await Meeting.findOne({ id });

    if (!meeting) {
      return NextResponse.json(
        {
          success: false,
          error: 'Meeting not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch meeting',
      },
      { status: 500 }
    );
  }
}

// PUT /api/meetings/[id] - Update a specific meeting
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body: Partial<MeetingData> = await request.json();

    // Prevent changing the ID
    if (body.id && body.id !== id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot change meeting ID',
        },
        { status: 400 }
      );
    }

    const meeting = await Meeting.findOneAndUpdate(
      { id },
      body,
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return NextResponse.json(
        {
          success: false,
          error: 'Meeting not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update meeting',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[id] - Delete a specific meeting
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const meeting = await Meeting.findOneAndDelete({ id });

    if (!meeting) {
      return NextResponse.json(
        {
          success: false,
          error: 'Meeting not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete meeting',
      },
      { status: 500 }
    );
  }
}
