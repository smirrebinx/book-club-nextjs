import Image from 'next/image';
import React from "react";

const StaticCalendar: React.FC = () => {
  return (
    <Image
      src="/animations/freepikCalendar.jpg"
      alt="Kalender illustration"
      width={200}
      height={200}
      priority
    />
  );
};

export default StaticCalendar;