import { APP_NAME } from "@/constants";

export const metadata = {
  title: `Rösta - ${APP_NAME}`,
  description: "Rösta på nästa bok som bokklubben ska läsa.",
};

export default function Vote() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--secondary-text)",
      }}
    >
      <main
        className="flex w-full max-w-3xl flex-col items-start gap-8 px-4 py-8 sm:px-16 sm:py-32"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Heading */}
        <h1
          className="px-4 text-3xl leading-10 tracking-wide sm:px-0"
          style={{
            fontFamily: "var(--font-newyorker)",
            color: "var(--primary-text)",
          }}
        >
          Rösta
        </h1>

        {/* Content */}
        <div
          className="flex w-full flex-col gap-6 px-4 sm:px-0"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--secondary-text)",
          }}
        >
          <p className="text-lg leading-7">
            Här kan du rösta på nästa bok som bokklubben ska läsa.
          </p>
        </div>
      </main>
    </div>
  );
}
