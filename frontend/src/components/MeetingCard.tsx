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

function BookInfo({ title, author }: { title?: string; author?: string }) {
  if (!title && !author) return null;

  return (
    <div className="flex flex-col gap-1">
      {title && (
        <p className="text-lg leading-7">
          <span className="font-semibold">Titel:</span> {title}
        </p>
      )}
      {author && (
        <p className="text-lg leading-7">
          <span className="font-semibold">Författare:</span> {author}
        </p>
      )}
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

  return (
    <div className="flex flex-col gap-6">
      <MeetingSection title="Datum och tid" isPrimary={isPrimary}>
        <p className={`${textSize} leading-7`}>
          {meeting.date}, klockan {meeting.time}
        </p>
      </MeetingSection>

      <MeetingSection title="Plats" isPrimary={isPrimary}>
        <p className={`${textSize} leading-7`}>{meeting.location}</p>
      </MeetingSection>

      <MeetingSection title="Bok" isPrimary={isPrimary}>
        <BookInfo title={meeting.book?.title || 'Ingen bok vald'} author={meeting.book?.author || '-'} />
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
  return (
    <div className="flex flex-col gap-2">
      <p className="text-lg font-semibold" style={{ color: 'var(--primary-text)' }}>
        {meeting.date}, klockan {meeting.time}
      </p>
      <MeetingDetail label="Plats" value={meeting.location} />
      {meeting.book && (
        <MeetingDetail
          label="Bok"
          value={`${meeting.book.title} av ${meeting.book.author}`}
        />
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
