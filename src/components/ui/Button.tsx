import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    variant?: "default" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        let baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-amber)] disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";

        if (variant === "default") {
            baseStyles += " bg-[var(--bg-charred-muted)] text-[var(--text-cream)] shadow-sm hover:bg-[var(--bg-charred-deep)] border border-[var(--border-subtle)]";
        } else if (variant === "ghost") {
            baseStyles += " text-[var(--text-cream-muted)] hover:bg-[var(--bg-charred-muted)] hover:text-[var(--text-cream)]";
        }

        return (
            <Comp
                className={`${baseStyles} ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
