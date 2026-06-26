import { NextResponse } from 'next/server';

import { requireApproved, requireAdmin } from '@/lib/auth-helpers';
import { toSafeErrorMessage, UserFacingError } from '@/lib/errors';
import { createContextLogger } from '@/lib/logger';
import connectDB from '@/lib/mongodb';
import Meeting from '@/models/Meeting';

import type { MeetingData } from '@/types/meeting';
import type { NextRequest } from 'next/server';

const logger = createContextLogger('API/Meetings/[id]');

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/meetings/[id] - Get a specific meeting by ID (approved users can view)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireApproved();

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
    return NextResponse.json(
      { success: false, error: toSafeErrorMessage(error, 'Failed to fetch meeting') },
      { status: error instanceof UserFacingError ? 403 : 500 }
    );
  }
}

// PUT /api/meetings/[id] - Update a specific meeting (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    logger.debug('PUT - Connecting to database...');
    await connectDB();
    logger.debug('PUT - Database connected');

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

    logger.debug('PUT - Updating meeting:', id);
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

    logger.debug('PUT - Meeting updated successfully');
    return NextResponse.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: toSafeErrorMessage(error, 'Failed to update meeting') },
      { status: error instanceof UserFacingError ? 403 : 500 }
    );
  }
}

// DELETE /api/meetings/[id] - Delete a specific meeting (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    logger.debug('DELETE - Connecting to database...');
    await connectDB();
    logger.debug('DELETE - Database connected');

    const { id } = await params;

    logger.debug('DELETE - Deleting meeting:', id);
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

    logger.debug('DELETE - Meeting deleted successfully');
    return NextResponse.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: toSafeErrorMessage(error, 'Failed to delete meeting') },
      { status: error instanceof UserFacingError ? 403 : 500 }
    );
  }
}
