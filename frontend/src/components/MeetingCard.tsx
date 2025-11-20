import Image from 'next/image';

import { BookPlaceholder } from '@/components/BookPlaceholder';
import { formatSwedishDate } from '@/lib/dateUtils';

import type { MeetingData } from '@/types/meeting';

interface MeetingCardProps {
  meeting: MeetingData;
  variant?: 'primary' | 'secondary';
  showFullDetails?: boolean;
}

function MeetingDetail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <p className="text-base mt-1">
      <span className="font-semibold">{label}:</span> {value}
    </p>
  );
}

interface BookInfoProps {
  title?: string;
  author?: string;
  coverImage?: string;
  googleDescription?: string;
  isPrimary: boolean;
}

function BookInfo({ title, author, coverImage, googleDescription, isPrimary }: BookInfoProps) {
  if (!title && !author) return null;

  const textSize = isPrimary ? 'text-lg' : 'text-base';

  return (
    <div className="flex gap-4">
      {/* Book Cover */}
      {coverImage && (
        <div className={`relative flex-shrink-0 ${isPrimary ? 'w-24 h-36' : 'w-20 h-30'}`}>
          <Image
            src={coverImage}
            alt={`Omslag för ${title}`}
            fill
            sizes={isPrimary ? '96px' : '80px'}
            className="object-cover rounded shadow-sm"
          />
        </div>
      )}
      {!coverImage && (
        <div className={`flex-shrink-0 ${isPrimary ? 'w-24' : 'w-20'}`}>
          <BookPlaceholder />
        </div>
      )}
      {/* Book Details */}
      <div className="flex flex-col gap-2 flex-1">
        {title && (
          <p className={`${textSize} leading-7`}>
            <span className="font-semibold">Titel:</span> {title}
          </p>
        )}
        {author && (
          <p className={`${textSize} leading-7`}>
            <span className="font-semibold">Författare:</span> {author}
          </p>
        )}
        {googleDescription && (
          <p className={`${isPrimary ? 'text-base' : 'text-sm'} mt-1 line-clamp-4`}>
            {googleDescription}
          </p>
        )}
      </div>
    </div>
  );
}

function MeetingSection({
  title,
  isPrimary,
  children
}: {
  title: string;
  isPrimary: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3
        className={`${isPrimary ? 'text-xl' : 'text-lg'} font-semibold`}
        style={{ color: 'var(--primary-text)' }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function FullMeetingDetails({ meeting, isPrimary }: { meeting: MeetingData; isPrimary: boolean }) {
  const textSize = isPrimary ? 'text-lg' : 'text-base';
  const formattedDate = meeting.date ? formatSwedishDate(meeting.date) : meeting.date;

  return (
    <div className="flex flex-col gap-6">
      <MeetingSection title="Datum och tid" isPrimary={isPrimary}>
        <p className={`${textSize} leading-7`}>
          {formattedDate}, klockan {meeting.time}
        </p>
      </MeetingSection>

      <MeetingSection title="Plats" isPrimary={isPrimary}>
        <p className={`${textSize} leading-7`}>{meeting.location}</p>
      </MeetingSection>

      <MeetingSection title="Bok" isPrimary={isPrimary}>
        <BookInfo
          title={meeting.book?.title || 'Ingen bok vald'}
          author={meeting.book?.author || '-'}
          coverImage={meeting.book?.coverImage}
          googleDescription={meeting.book?.googleDescription}
          isPrimary={isPrimary}
        />
      </MeetingSection>

      {meeting.additionalInfo && (
        <MeetingSection title="Övrigt" isPrimary={isPrimary}>
          <p className={`${textSize} leading-7`}>{meeting.additionalInfo}</p>
        </MeetingSection>
      )}
    </div>
  );
}

function CompactMeetingDetails({ meeting }: { meeting: MeetingData }) {
  const formattedDate = meeting.date ? formatSwedishDate(meeting.date) : meeting.date;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-semibold" style={{ color: 'var(--primary-text)' }}>
        {formattedDate}, klockan {meeting.time}
      </p>
      <MeetingDetail label="Plats" value={meeting.location} />
      {meeting.book && (
        <div className="mt-2">
          <p className="text-base font-semibold mb-2" style={{ color: 'var(--primary-text)' }}>
            Bok
          </p>
          <BookInfo
            title={meeting.book.title}
            author={meeting.book.author}
            coverImage={meeting.book.coverImage}
            googleDescription={meeting.book.googleDescription}
            isPrimary={false}
          />
        </div>
      )}
      {meeting.additionalInfo && (
        <p className="text-sm mt-2 text-gray-600">
          {meeting.additionalInfo}
        </p>
      )}
    </div>
  );
}

export function MeetingCard({ meeting, variant = 'primary', showFullDetails = true }: MeetingCardProps) {
  const isPrimary = variant === 'primary';

  return (
    <div
      className={`
        rounded-lg p-6 shadow-md
        ${isPrimary ? 'bg-white border-2' : 'bg-white border-l-4'}
      `}
      style={{
        borderColor: 'var(--primary-border)',
        fontFamily: 'var(--font-body)',
        color: 'var(--secondary-text)',
      }}
    >
      {showFullDetails ? (
        <FullMeetingDetails meeting={meeting} isPrimary={isPrimary} />
      ) : (
        <CompactMeetingDetails meeting={meeting} />
      )}
    </div>
  );
}
