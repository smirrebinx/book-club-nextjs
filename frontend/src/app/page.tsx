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
        className="flex min-h-screen w-full max-w-3xl flex-col items-start justify-between py-8 px-4 sm:py-32 sm:px-16"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="flex w-full flex-col items-start gap-6 text-left">
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
            Välkommen till Barnfria bokklubben! Här kan du se vilka böcker vi har läst, lägga till egna boktips och rösta på nästa bok att läsa. Du hittar också information om tid och plats för nästa bokträff samt vilken bok vi ska läsa till träffen.
          </p>
        </div>
      </main>
    </div>
  );
}