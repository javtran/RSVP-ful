// Abstract geometric SVG covers — deterministic per event ID

const SCHEMES = [
  { bg: "#e8e4f0", shapes: ["#c4b8e0", "#a89cc8", "#8c80b0"] },
  { bg: "#e4ede8", shapes: ["#b8d4c0", "#9cbfaa", "#80aa94"] },
  { bg: "#f0e8e4", shapes: ["#e0c4b8", "#c8a89c", "#b08c80"] },
  { bg: "#e4eaf0", shapes: ["#b8cce0", "#9cb4c8", "#809cb0"] },
  { bg: "#f0ece4", shapes: ["#e0d4b8", "#c8bc9c", "#b0a480"] },
  { bg: "#eae4f0", shapes: ["#ccb8e0", "#b49cc8", "#9c80b0"] },
];

function pick<T>(arr: T[], id: string, offset = 0): T {
  return arr[Math.abs(id.charCodeAt(offset) ?? 0) % arr.length];
}

function hash(id: string): number[] {
  return Array.from(id).map((c) => c.charCodeAt(0));
}

export function EventCover({
  eventId,
  className = "",
}: {
  eventId: string;
  className?: string;
}) {
  const scheme = pick(SCHEMES, eventId, 0);
  const h = hash(eventId);

  // Three shapes with deterministic positions/sizes from the event ID
  const circle1 = {
    cx: 20 + (h[0] % 60),
    cy: 20 + (h[1] % 50),
    r: 30 + (h[2] % 40),
  };
  const circle2 = {
    cx: 40 + (h[3] % 60),
    cy: 30 + (h[4] % 60),
    r: 20 + (h[5] % 50),
  };
  const rect = {
    x: (h[6] % 80) - 20,
    y: (h[7] % 80) - 20,
    w: 40 + (h[8] % 60),
    h: 40 + (h[9] % 60),
    rx: 6 + (h[10] % 20),
    rotate: (h[11] % 60) - 30,
  };

  return (
    <div className={`w-full overflow-hidden ${className}`} style={{ background: scheme.bg }}>
      <svg
        viewBox="0 0 200 160"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle
          cx={circle1.cx}
          cy={circle1.cy}
          r={circle1.r}
          fill={scheme.shapes[0]}
          opacity="0.6"
        />
        <rect
          x={rect.x}
          y={rect.y}
          width={rect.w}
          height={rect.h}
          rx={rect.rx}
          fill={scheme.shapes[1]}
          opacity="0.5"
          transform={`rotate(${rect.rotate} 100 80)`}
        />
        <circle
          cx={circle2.cx}
          cy={circle2.cy}
          r={circle2.r}
          fill={scheme.shapes[2]}
          opacity="0.55"
        />
        {/* Subtle grid lines */}
        <line x1="0" y1="80" x2="200" y2="80" stroke={scheme.shapes[0]} strokeWidth="0.5" opacity="0.3" />
        <line x1="100" y1="0" x2="100" y2="160" stroke={scheme.shapes[0]} strokeWidth="0.5" opacity="0.3" />
      </svg>
    </div>
  );
}
