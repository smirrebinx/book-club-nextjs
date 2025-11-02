import { redirect } from 'next/navigation';

import LottieAnimation from "@/components/LottieAnimation";
import NextMeetingCard from "@/components/NextMeetingCard";
import { APP_NAME } from "@/constants";
import { nextMeetingData } from "@/data/nextMeeting";
import { auth } from '@/lib/auth';

export const metadata = {
  title: APP_NAME,
};

export default async function Home() {
  const session = await auth();

  // Redirect pending users to pending page
  if (session?.user && !session.user.isApproved) {
    redirect('/auth/pending');
  }
  return (
    <div
      className="flex min-h-screen items-start justify-center"
      style={{ backgroundColor: "var(--background)", color: "var(--secondary-text)" }}
    >
      <main
        className="flex w-full max-w-3xl flex-col items-start pt-4 pb-8 px-4 sm:pt-8 sm:pb-16 sm:px-16"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="flex w-full flex-col items-start gap-1 text-left">
          <div className="flex w-full justify-center sm:justify-start">
            <LottieAnimation
              src="/animations/animationBooks.lottie"
              width={200}
              height={200}
              ariaLabel="Animerad bokklubbslogotyp"
              isDecorative={false}
            />
          </div>

          {/* Heading */}
          <h1
            className="max-w-xs px-4 text-3xl leading-10 tracking-wide sm:px-0"
            style={{
              fontFamily: "var(--font-newyorker)",
              color: "var(--primary-text)",
            }}
          >
            {APP_NAME}
          </h1>

          {/* Paragraph */}
          <p
            className="max-w-md px-4 text-lg leading-8 sm:px-0"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--secondary-text)",
            }}
          >
            Välkommen till Barnfria bokklubben! Här kan du se vilka böcker vi har läst, lägga till egna boktips och rösta på nästa bok att läsa.
          </p>

          {/* Next Meeting Card */}
          <div className="w-full px-4 sm:px-0">
            <NextMeetingCard meetingData={nextMeetingData} />
          </div>
        </div>
      </main>
    </div>
  );
}