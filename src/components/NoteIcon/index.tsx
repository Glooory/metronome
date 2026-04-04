interface NoteIconProps {
  value: number;
  size?: number;
  className?: string;
}

export const NoteIcon = ({ value, size = 16, className }: NoteIconProps) => {
  const isDotted = [0.75, 0.375, 0.1875].includes(value);
  const baseValue = isDotted ? value / 1.5 : value;

  // Constants for standard proportions - slightly enlarged head for visibility
  const headRx = 5.2;
  const headRy = 3.6;
  const strokeWidth = 1.8;
  const stemWidth = 1.4;
  const headCy = 18.5;
  const headCx = 8;
  const rotation = -25;

  // Calculate the tangent point for the stem on the right side of the rotated ellipse
  // Shifting 1 unit further left per user feedback for smoother integration
  const stemX = headCx + headRx * 0.85 - 1;

  return (
    <div className={className} style={{ display: "inline-flex", alignItems: "center" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Note Head */}
        {baseValue === 0.5 ? (
          <ellipse
            cx={headCx}
            cy={headCy}
            rx={headRx - strokeWidth / 2}
            ry={headRy - strokeWidth / 2}
            transform={`rotate(${rotation} ${headCx} ${headCy})`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        ) : (
          <ellipse
            cx={headCx}
            cy={headCy}
            rx={headRx}
            ry={headRy}
            transform={`rotate(${rotation} ${headCx} ${headCy})`}
          />
        )}

        {/* Stem */}
        {baseValue < 1 && (
          <rect
            x={stemX}
            y={2}
            width={stemWidth}
            height={headCy - 2 + 1}
            rx={stemWidth / 2}
            fill="currentColor"
          />
        )}

        {/* Flags */}
        {baseValue === 0.125 && (
          <path
            d={`M${stemX + 1} 2.5C${stemX + 1} 2.5 18.5 4 18.5 8.5C18.5 10.5 17 12 17 12`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}
        {baseValue === 0.0625 && (
          <>
            <path
              d={`M${stemX + 1} 2.5C${stemX + 1} 2.5 19.5 3.5 19.5 8C19.5 10 18.5 11 18.5 11`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d={`M${stemX + 1} 7.5C${stemX + 1} 7.5 19.5 8.5 19.5 13C19.5 15 18.5 16 18.5 16`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Dot */}
        {isDotted && <circle cx={headCx + headRx + 6} cy={headCy - 1} r="2" />}
      </svg>
    </div>
  );
};
