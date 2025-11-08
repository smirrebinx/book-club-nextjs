import React from "react";

const StaticCalendar: React.FC = () => {
  const width = 200;
  const height = 213;
  const headerHeight = 27;
  const weekdayHeight = 13;
  const headerMargin = 8; // Margin under header
  const cols = 7;
  const rows = 5; // 31 days fits in 5 rows
  const cellWidth = width / cols;
  const cellHeight = (height - headerHeight - headerMargin - weekdayHeight) / rows;

  // const weekdays = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Header */}
      <rect
        x="0"
        y="0"
        width={width}
        height={headerHeight}
        rx="6"
        fill="var(--primary-border)"
      />
      <text
        x={width / 2}
        y={headerHeight / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontWeight="bold"
        fill="white"
      >
        2025
      </text>

      {/* Weekday labels
      {weekdays.map((day, i) => {
        const x = i * cellWidth + cellWidth / 2;
        const y = headerHeight + headerMargin + weekdayHeight / 1.5;
        return (
          <text
            key={day}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="var(--secondary-border)"
          >
            {day}
          </text>
        );
      })} */}

      {/* Outer border */}
      <rect
        x="0"
        y={headerHeight + headerMargin + weekdayHeight}
        width={width}
        height={height - headerHeight - headerMargin - weekdayHeight}
        fill="white"
        stroke="var(--secondary-border)"
        strokeWidth="2"
        rx="6"
      />

      {/* Grid lines */}
      {Array.from({ length: cols - 1 }, (_, i) => (
        <line
          key={`v-${i}`}
          x1={(i + 1) * cellWidth}
          y1={headerHeight + headerMargin + weekdayHeight}
          x2={(i + 1) * cellWidth}
          y2={height}
          stroke="var(--secondary-border)"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: rows - 1 }, (_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={headerHeight +  headerMargin + weekdayHeight + (i + 1) * cellHeight}
          x2={width}
          y2={headerHeight +  headerMargin + weekdayHeight + (i + 1) * cellHeight}
          stroke="var(--secondary-border)"
          strokeWidth="1"
        />
      ))}

      {/* Day numbers */}
      {days.map((day, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * cellWidth + cellWidth / 2;
        const y = headerHeight +  headerMargin + weekdayHeight + row * cellHeight + cellHeight / 2;

        return (
          <text
            key={day}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fill="var(--secondary-border)"
          >
            {day}
          </text>
        );
      })}
    </svg>
  );
};

export default StaticCalendar;