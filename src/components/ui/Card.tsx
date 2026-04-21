import { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glow";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const base =
      "rounded-xl border bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(234,227,217,0.03)]";
    const variants = {
      default: "border-[var(--border-subtle)]",
      glow:
        "border-[var(--border-glow)] shadow-[inset_0_1px_0_rgba(234,227,217,0.04),inset_0_0_28px_rgba(224,142,54,0.08)]",
    };
    return (
      <div
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card };
