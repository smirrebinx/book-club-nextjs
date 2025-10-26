import LottieAnimation from "@/components/LottieAnimation";
import { APP_NAME } from "@/constants";

export const metadata = {
  title: APP_NAME,
};

export default function Home() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "var(--background)", color: "var(--secondary-text)" }}
    >
      <main
        className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <LottieAnimation width={200} height={200} />

          {/* Heading */}
          <h1
            className="max-w-xs text-3xl leading-10 tracking-wide"
            style={{
              fontFamily: "var(--font-newyorker)",
              color: "var(--primary-text)",
            }}
          >
            {APP_NAME}
          </h1>

          {/* Paragraph */}
          <p
            className="max-w-md text-lg leading-8"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--secondary-text)",
            }}
          >
            Välkommen till Barnfria bokklubben! Här kan du se vilka böcker vi läst,
            lägga till förslag på böcker samt rösta på nästa bok att läsa. Här finns
            även information om var och när nästa bokträff kommer vara samt vilken bok vi ska
            läsa till träffen.
          </p>
        </div>
      </main>
    </div>
  );
}