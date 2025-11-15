import { NextResponse } from 'next/server';

import { requireApproved } from '@/lib/auth-helpers';
import connectDB from '@/lib/mongodb';
import BookSuggestion from '@/models/BookSuggestion';

import type { Types } from 'mongoose';
import type { NextRequest} from 'next/server';

interface SuggestionQuery {
  status?: string | { $in: string[] };
}

// Type for the populated lean document
interface PopulatedLeanSuggestion {
  _id: Types.ObjectId;
  title: string;
  author: string;
  description: string;
  suggestedBy: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
  votes: Types.ObjectId[];
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  coverImage?: string;
  isbn?: string;
  googleBooksId?: string;
  googleDescription?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireApproved();

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'date';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    await connectDB();

    // Build query
    const query: SuggestionQuery = {};

    // Filter by status
    if (statusFilter) {
      query.status = statusFilter;
    } else {
      // By default, show pending and approved suggestions
      query.status = { $in: ['pending', 'approved', 'currently_reading'] };
    }

    // Build sort
    const sort = { createdAt: -1 as const }; // Default: newest first

    if (sortBy === 'votes') {
      // Sort by vote count (requires aggregation)
      const suggestions = await BookSuggestion.aggregate([
        { $match: query },
        {
          $addFields: {
            voteCount: { $size: '$votes' },
          },
        },
        { $sort: { voteCount: -1, createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'suggestedBy',
            foreignField: '_id',
            as: 'suggestedByUser',
          },
        },
        {
          $addFields: {
            suggestedByUser: { $arrayElemAt: ['$suggestedByUser', 0] },
            hasVoted: { $in: [session.user.id, { $ifNull: ['$votes', []] }] },
          },
        },
      ]);

      const total = await BookSuggestion.countDocuments(query);

      return NextResponse.json({
        suggestions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // Regular query for date sorting
    const total = await BookSuggestion.countDocuments(query);

    const suggestions = await BookSuggestion.find(query)
      .populate('suggestedBy', 'name email')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean<PopulatedLeanSuggestion[]>();

    // Add vote count and hasVoted to each suggestion
    const suggestionsWithVotes = suggestions.map((suggestion) => ({
      ...suggestion,
      voteCount: suggestion.votes?.length || 0,
      hasVoted: suggestion.votes?.some(
        (vote) => vote.toString() === session.user.id
      ) || false,
    }));

    return NextResponse.json({
      suggestions: suggestionsWithVotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Kunde inte hämta förslag' },
      { status: 500 }
    );
  }
}