/**
 * Taverrn wordmark + stein icon. Use for header and favicon source.
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
          <SteinIcon />
        </span>
      )}
      <span
        className={`font-semibold tracking-tight text-[var(--text-cream)] ${sizes[size]}`}
        style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
      >
        Taverrn
      </span>
    </div>
  );
}

/** Simple stein/tankard icon - warm, recognizable, not generic */
function SteinIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden>
      <style>{`
        /* Define the animation keyframes */
        @keyframes bubble-rise-pop {
          0% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
          20% {
             opacity: 0.8; /* Bubbles appear quickly near the foam */
          }
          80% {
            /* Float up and slightly sideways based on variable */
            transform: translate(var(--drift-x, 2px), -12px) scale(1); 
            opacity: 0.6;
          }
          100% {
            /* The "POP": Rapid expansion and disappearance */
            transform: translate(var(--drift-x, 3px), -14px) scale(3); 
            opacity: 0; 
          }
        }

        /* Base bubble style */
        .ale-bubble {
          fill: currentColor;
          /* The animation applies here */
          animation: bubble-rise-pop 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
          opacity: 0; /* Start hidden so delays work correctly */
        }

        /* Specific bubble timings and drifts so they don't look synchronized */
        .b1 { animation-delay: 0s; --drift-x: -2px; }
        .b2 { animation-delay: 0.7s; --drift-x: 1px; }
        .b3 { animation-delay: 1.4s; --drift-x: 3px; r: 0.5; } /* Make one slightly smaller */
      `}</style>
      <g id="tankard-body">
        <path d="M7 11L8 25C8.2 26.5 9.5 27.5 11 27.5H21C22.5 27.5 23.8 26.5 24 25L25 11"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M12 15V23M16 15V24M20 15V23"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />

        <path d="M6.5 11.5C6.5 9 8 8 10 8C11 6.5 13 6 15 6.5C17 5.5 19.5 6 20.5 8C22.5 7.5 25 8.5 25.5 11"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        <path d="M25 13H27.5C29 13 30 14 30 15.5V20.5C30 22 29 23 27.5 23H24.5"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M8.5 13.5H23.5" stroke="currentColor" strokeWidth="1" strokeDasharray="1 2" opacity="0.5" />
      </g>

      <circle className="ale-bubble b1" cx="11" cy="9" r="0.8" />
      <circle className="ale-bubble b2" cx="16" cy="8" r="0.8" />
      <circle className="ale-bubble b3" cx="21" cy="9" r="0.8" />
    </svg>
  );
}
