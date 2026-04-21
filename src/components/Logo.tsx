/**
 * Brewery wordmark + stein icon. Use for header and favicon source.
 */
export function Logo({
  className = "",
  showIcon = true,
  size = "md",
}: {
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-2xl",
    md: "text-4xl sm:text-5xl",
    lg: "text-5xl sm:text-6xl",
  };
  const iconSizes = {
    sm: "h-6 w-6 sm:h-7 sm:w-7",
    md: "h-9 w-9 sm:h-10 sm:w-10",
    lg: "h-11 w-11 sm:h-12 sm:w-12",
  };
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {showIcon && (
        <span
          className={`${iconSizes[size]} shrink-0 text-[var(--accent-amber)]`}
          aria-hidden
        >
          <BarrelIcon />
        </span>
      )}
      <span
        className={`font-semibold tracking-tight text-[var(--text-primary)] ${sizes[size]}`}
        
      >
        Brewery
      </span>
    </div>
  );
}

/** Modern Barrel with tap icon */
function BarrelIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden>
      <g id="barrel-body">
        {/* Main barrel outline */}
        <path d="M10 6 C 10 5, 22 5, 22 6 C 26 16, 26 22, 22 26 C 22 27, 10 27, 10 26 C 6 22, 6 16, 10 6 Z"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Horizontal metal bands */}
        <path d="M 8 11 L 24 11 M 8 21 L 24 21"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

        {/* Vertical staves */}
        <path d="M 13 11 L 13 21 M 16 11 L 16 21 M 19 11 L 19 21"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      </g>

      <g id="barrel-tap">
        {/* Spigot pipe */}
        <path d="M 23 18 L 27 18 A 1 1 0 0 1 28 19 L 28 22"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Tap handle */}
        <path d="M 26.5 15 L 26.5 18"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
