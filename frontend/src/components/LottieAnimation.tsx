"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import DotLottieReact with ssr: false to prevent hydration mismatch
const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false }
);

interface LottieAnimationProps {
  src?: string;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  ariaLabel?: string;       // optional label for screen readers
  isDecorative?: boolean;   // if true, aria-hidden
}

export default function LottieAnimation({
  src = "/animations/animationBooks.lottie",
  width = 300,
  height = 300,
  loop = true,
  autoplay = true,
  className = "",
  ariaLabel,
  isDecorative = false,
}: LottieAnimationProps) {
  const [shouldAutoplay, setShouldAutoplay] = useState(autoplay);

  // Handle prefers-reduced-motion for accessibility (WCAG 2.2.2)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldAutoplay(!mediaQuery.matches && autoplay);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldAutoplay(!e.matches && autoplay);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [autoplay]);

  return (
    <DotLottieReact
      src={src}
      loop={loop}
      autoplay={shouldAutoplay}
      style={{ width, height }}
      className={className}
      aria-label={isDecorative ? undefined : ariaLabel}
      aria-hidden={isDecorative ? true : undefined}
    />
  );
}