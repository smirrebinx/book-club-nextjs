import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

import type { NextRequest } from 'next/server';

/**
 * Test endpoint to verify database connectivity and write operations
 * DELETE THIS FILE after testing is complete
 */
export async function GET(_request: NextRequest) {
  const startTime = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    steps: [],
  };

  try {
    // Step 1: Check authentication
    diagnostics.steps.push('Checking authentication...');
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only', diagnostics },
        { status: 403 }
      );
    }
    diagnostics.steps.push('✅ Authentication successful');
    diagnostics.user = session.user.email;

    // Step 2: Check MongoDB URI
    diagnostics.steps.push('Checking MongoDB URI...');
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      diagnostics.steps.push('❌ MONGODB_URI not found');
      return NextResponse.json(
        { error: 'MONGODB_URI not configured', diagnostics },
        { status: 500 }
      );
    }
    diagnostics.steps.push('✅ MONGODB_URI configured');
    diagnostics.mongoUriPrefix = mongoUri.substring(0, 30) + '...';

    // Step 3: Connect to database
    diagnostics.steps.push('Connecting to MongoDB...');
    const mongoose = await connectDB();
    diagnostics.steps.push('✅ MongoDB connection established');
    diagnostics.connectionState = mongoose.connection.readyState;
    diagnostics.connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    diagnostics.currentState = diagnostics.connectionStates[mongoose.connection.readyState];

    // Step 4: Test READ operation
    diagnostics.steps.push('Testing READ operation...');
    const userCount = await User.countDocuments();
    diagnostics.steps.push(`✅ READ successful - Found ${userCount} users`);
    diagnostics.userCount = userCount;

    // Step 5: Test WRITE operation (create a test document)
    diagnostics.steps.push('Testing WRITE operation...');
    const testEmail = `test-${Date.now()}@dbtest.local`;
    const testUser = await User.create({
      email: testEmail,
      name: 'DB Test User',
      role: 'pending',
      isApproved: false,
    });
    diagnostics.steps.push('✅ WRITE successful - Test user created');
    diagnostics.testUserId = testUser._id.toString();

    // Step 6: Test UPDATE operation
    diagnostics.steps.push('Testing UPDATE operation...');
    await User.findByIdAndUpdate(testUser._id, {
      name: 'DB Test User (Updated)',
    });
    diagnostics.steps.push('✅ UPDATE successful');

    // Step 7: Test DELETE operation (cleanup)
    diagnostics.steps.push('Testing DELETE operation...');
    await User.findByIdAndDelete(testUser._id);
    diagnostics.steps.push('✅ DELETE successful - Test user removed');

    // Step 8: Final verification
    diagnostics.steps.push('Verifying cleanup...');
    const deletedUser = await User.findById(testUser._id);
    if (deletedUser) {
      diagnostics.steps.push('⚠️ WARNING: Test user still exists');
    } else {
      diagnostics.steps.push('✅ Cleanup verified - Test user removed');
    }

    const endTime = Date.now();
    diagnostics.totalTimeMs = endTime - startTime;
    diagnostics.steps.push(`✅ All tests passed in ${diagnostics.totalTimeMs}ms`);

    return NextResponse.json({
      success: true,
      message: 'Database connectivity test PASSED - All operations working!',
      diagnostics,
    });

  } catch (error) {
    const endTime = Date.now();
    diagnostics.totalTimeMs = endTime - startTime;
    diagnostics.steps.push(`❌ Test FAILED after ${diagnostics.totalTimeMs}ms`);

    return NextResponse.json({
      success: false,
      message: 'Database connectivity test FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      diagnostics,
    }, { status: 500 });
  }
}
