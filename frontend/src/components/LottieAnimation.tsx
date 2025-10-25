'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LottieAnimationProps {
  src?: string;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export default function LottieAnimation({
  src = '/animations/animationBooks.lottie',
  width = 300,
  height = 300,
  loop = true,
  autoplay = true,
  className = '',
}: LottieAnimationProps) {
  return (
    <DotLottieReact
      src={src}
      loop={loop}
      autoplay={autoplay}
      style={{ width, height }}
      className={className}
    />
  );
}
