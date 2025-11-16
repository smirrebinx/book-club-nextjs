'use client';

import Image from 'next/image';
import { useState } from 'react';

import { BookPlaceholder } from '@/components/BookPlaceholder';

interface ReadBook {
  _id: string;
  title: string;
  author: string;
  description: string;
  googleDescription?: string;
  coverImage?: string;
  isbn?: string;
  suggestedBy: {
    name: string;
  };
  createdAt: string;
}

function ExpandableDescription({ description, bookTitle }: { description: string; bookTitle: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > 200;

  return (
    <div>
      <p className={`text-sm text-gray-700 ${!isExpanded && shouldTruncate ? 'line-clamp-3' : ''}`}>
        {description}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-[var(--link-color)] hover:text-[var(--link-hover)] hover:underline mt-1 focus:outline-2 focus:outline-offset-2"
          style={{ outlineColor: 'var(--focus-ring)' }}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Visa mindre' : `Läs mer om ${bookTitle}`}
        </button>
      )}
    </div>
  );
}

interface BookDescriptionsProps {
  googleDescription?: string;
  description: string;
  title: string;
}

function BookDescriptions({ googleDescription, description, title }: BookDescriptionsProps) {
  return (
    <>
      {googleDescription && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-800 mb-1">Om boken:</p>
          <ExpandableDescription description={googleDescription} bookTitle={title} />
        </div>
      )}

      {description && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-800 mb-1">Motivering:</p>
          <p className="text-sm text-gray-700">{description}</p>
        </div>
      )}
    </>
  );
}

export function ReadBooksList({ books }: { books: ReadBook[] }) {
  if (books.length === 0) {
    return (
      <p className="text-lg leading-7" style={{ color: 'var(--secondary-text)' }}>
        Bokklubben har inte markerat några böcker som lästa ännu.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <article key={book._id} className="bg-white rounded-lg shadow p-6">
          {/* Desktop: side-by-side, Mobile: stacked */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Cover and basic info wrapper - side by side on all screens */}
            <div className="flex gap-4 sm:flex-1">
              <div className="relative w-24 h-32 flex-shrink-0">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={`Omslag för ${book.title}`}
                    fill
                    sizes="96px"
                    className="object-cover rounded shadow-sm"
                  />
                ) : (
                  <BookPlaceholder />
                )}
              </div>
              <div className="flex-1 sm:flex-initial">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {book.title}
                </h2>
                <p className="text-gray-600 mb-2">av {book.author}</p>
                {book.isbn && (
                  <p className="text-xs text-gray-500 mb-2">ISBN: {book.isbn}</p>
                )}
                {/* On larger screens, show descriptions here */}
                <div className="hidden sm:block">
                  <BookDescriptions
                    googleDescription={book.googleDescription}
                    description={book.description}
                    title={book.title}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile only: descriptions below the cover/title section */}
          <div className="sm:hidden">
            <BookDescriptions
              googleDescription={book.googleDescription}
              description={book.description}
              title={book.title}
            />
          </div>

        </article>
      ))}
    </div>
  );
}
