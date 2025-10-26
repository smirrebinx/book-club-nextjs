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
          <LottieAnimation
            src="/animations/animationBooks.lottie"
            width={200}
            height={200}
            ariaLabel="Animerad bokklubbslogotyp"
            isDecorative={false}
          />

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
            Välkommen till Barnfria bokklubben! Här kan du se vilka böcker vi har läst, lägga till egna boktips och rösta på nästa bok att läsa. Du hittar också information om tid och plats för nästa bokträff samt vilken bok vi ska läsa till träffen.
          </p>
        </div>
      </main>
    </div>
  );
}