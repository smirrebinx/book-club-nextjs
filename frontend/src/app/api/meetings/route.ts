import { NextResponse } from 'next/server';

import { requireApproved, requireAdmin } from '@/lib/auth-helpers';
import { createContextLogger } from '@/lib/logger';
import connectDB from '@/lib/mongodb';
import { createRateLimitMiddleware } from '@/lib/rateLimit';
import Meeting from '@/models/Meeting';

import type { MeetingData } from '@/types/meeting';
import type { NextRequest } from 'next/server';

const logger = createContextLogger('API/Meetings');
const rateLimitMiddleware = createRateLimitMiddleware({
  limit: 50,
  windowMs: 60000 // 50 requests per minute
});

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

    logger.debug('POST /api/meetings - Connecting to database...');
    await connectDB();
    logger.debug('POST /api/meetings - Database connected');

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

    logger.debug('POST /api/meetings - Creating meeting with ID:', body.id);
    const meeting = await Meeting.create(body);
    logger.debug('POST /api/meetings - Meeting created successfully');

    return NextResponse.json(
      {
        success: true,
        data: meeting,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    logger.error('POST /api/meetings - Error creating meeting:', error);

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

    // Return sanitized error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to create meeting';
    logger.error('POST /api/meetings - Error details:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Kunde inte skapa möte',
      },
      { status: 500 }
    );
  }
}
