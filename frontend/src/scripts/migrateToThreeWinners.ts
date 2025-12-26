// Load environment variables from .env.local BEFORE any imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from the frontend directory
config({ path: resolve(__dirname, '../../.env.local') });

// Now safe to import modules
import mongoose from 'mongoose';

// Import models directly (not connectDB which checks env at import time)
import BookSuggestion from '@/models/BookSuggestion';
import VotingRound from '@/models/VotingRound';

// Helper function to connect to MongoDB (replaces connectDB import)
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (mongoose.connection.readyState === 1) {
    console.log('[MongoDB] Already connected');
    return;
  }

  console.log('[MongoDB] Connecting to database...');
  await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });
  console.log('[MongoDB] Connected successfully');
}

interface MigrationSummary {
  legacyWinners: { title: string; author: string; status: string }[];
  pendingBooks: number;
  votesToClear: number;
  willCreateLegacyRound: boolean;
  willCreateActiveRound: boolean;
}

async function analyzeMigration(): Promise<MigrationSummary> {
  await connectToDatabase();

  // Find legacy winners (books with old statuses)
  const legacyWinners = await BookSuggestion.find({
    status: { $in: ['approved', 'currently_reading'] }
  }).lean();

  // Count pending books and their votes
  const pendingBooks = await BookSuggestion.find({ status: 'pending' }).lean();
  const votesToClear = pendingBooks.reduce((sum, book) => sum + (book.votes?.length || 0), 0);

  // Check if rounds already exist
  const existingRounds = await VotingRound.countDocuments();

  return {
    legacyWinners: legacyWinners.map(b => ({
      title: b.title,
      author: b.author,
      status: b.status
    })),
    pendingBooks: pendingBooks.length,
    votesToClear,
    willCreateLegacyRound: legacyWinners.length > 0 && existingRounds === 0,
    willCreateActiveRound: existingRounds === 0,
  };
}

async function performMigration(dryRun = true): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  MIGRATION: Single-Winner → 3-Winner Voting System`);
  console.log(`  Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE RUN'}`);
  console.log(`${'='.repeat(60)}\n`);

  // Connect to database FIRST
  await connectToDatabase();

  // Then start session
  const session = await mongoose.startSession();

  if (!dryRun) {
    session.startTransaction();
  }

  try {

    // STEP 1: Analyze current state
    const summary = await analyzeMigration();

    console.log('📊 Current State Analysis:\n');
    console.log(`  Legacy Winners (approved/currently_reading): ${summary.legacyWinners.length}`);
    summary.legacyWinners.forEach(b => {
      console.log(`    - "${b.title}" by ${b.author} (${b.status})`);
    });

    console.log(`\n  Pending Books: ${summary.pendingBooks}`);
    console.log(`  Total Votes to Clear: ${summary.votesToClear}`);
    console.log(`\n  Will Create Legacy Round: ${summary.willCreateLegacyRound ? 'Yes' : 'No'}`);
    console.log(`  Will Create Active Round: ${summary.willCreateActiveRound ? 'Yes' : 'No'}\n`);

    if (dryRun) {
      console.log('✅ DRY RUN COMPLETE - No changes made');
      console.log('\nTo apply these changes, run:');
      console.log('  npx tsx src/scripts/migrateToThreeWinners.ts --live\n');
      return;
    }

    // STEP 2: Create legacy round for old winners (if any)
    if (summary.willCreateLegacyRound) {
      console.log('📝 Creating legacy voting round...');

      const legacyWinners = await BookSuggestion.find({
        status: { $in: ['approved', 'currently_reading'] }
      }).session(session);

      const legacyRound = await VotingRound.create([{
        roundNumber: 0,
        status: 'completed',
        winners: legacyWinners.map((book, idx) => ({
          bookId: book._id,
          placement: (idx + 1) as 1 | 2 | 3,
          voteCount: book.votes?.length || 0,
        })),
        finalizedAt: new Date(),
        completedAt: new Date(),
      }], { session });

      console.log(`  ✓ Legacy round #0 created with ${legacyWinners.length} winners`);

      // Update legacy winners with metadata
      for (const book of legacyWinners) {
        book.votingRound = legacyRound[0]._id;
        book.placement = (legacyWinners.indexOf(book) + 1) as 1 | 2 | 3;
        book.wonAt = new Date();
        book.status = 'read';
        await book.save({ session });
      }

      console.log(`  ✓ ${legacyWinners.length} books moved to 'read' status with metadata`);
    }

    // STEP 3: Create first active round
    if (summary.willCreateActiveRound) {
      console.log('\n📝 Creating first active round...');

      await VotingRound.create([{
        roundNumber: 1,
        status: 'active',
        winners: [],
      }], { session });

      console.log('  ✓ Active round #1 created');
    }

    // STEP 4: Clear pending votes (optional - start fresh)
    if (summary.votesToClear > 0) {
      console.log(`\n⚠️  Found ${summary.votesToClear} votes on ${summary.pendingBooks} pending books`);
      console.log('   Clearing votes for fresh start...');

      await BookSuggestion.updateMany(
        { status: 'pending' },
        { $set: { votes: [] } },
        { session }
      );

      console.log('  ✓ All pending votes cleared');
    }

    // STEP 5: Commit transaction
    await session.commitTransaction();

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ MIGRATION COMPLETE');
    console.log(`${'='.repeat(60)}\n`);

    console.log('Next steps:');
    console.log('  1. Deploy new VotingRound model to production');
    console.log('  2. Deploy updated server actions');
    console.log('  3. Deploy frontend components');
    console.log('  4. Admins can now finalize top 3 winners\n');

  } catch (error) {
    if (!dryRun) {
      await session.abortTransaction();
    }

    console.error('\n❌ MIGRATION FAILED:\n', error);
    throw error;

  } finally {
    session.endSession();
    await mongoose.connection.close();
  }
}

// CLI execution
const args = process.argv.slice(2);
const isDryRun = !args.includes('--live');

console.log('[Migration] Starting migration script...');
console.log('[Migration] Dry run mode:', isDryRun);

performMigration(isDryRun)
  .then(() => {
    console.log('[Migration] Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ MIGRATION SCRIPT FAILED:');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  });
