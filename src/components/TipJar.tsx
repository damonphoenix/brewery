"use client";

import { motion } from "framer-motion";
import { Coffee, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TipJarProps {
    onClose: () => void;
    fileName: string;
}

export function TipJar({ onClose, fileName }: TipJarProps) {
    // Replace this placeholder link with your actual tip link later
    const tipLink = "https://buymeacoffee.com/damonphoenix";

    return (
        <div
            className="flex min-h-[280px] w-full flex-col items-center justify-center p-6 text-center sm:min-h-[320px]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <motion.button
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute right-4 top-4 rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)]"
                aria-label="Close tip jar"
            >
                <X className="h-5 w-5" />
            </motion.button>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1,
                }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-amber)]/15 text-[var(--accent-amber)] shadow-[0_0_30px_rgba(224,142,54,0.3)] ring-1 ring-[var(--accent-amber)]/30"
            >
                <Heart className="h-8 w-8" />
            </motion.div>

            <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-2 text-2xl tracking-wide text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
                Brewed to Perfection.
            </motion.h2>

            <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]"
            >
                Your file <strong>{fileName}</strong> was brewed completely on your device.
                This web app is completely free and has no ads, so please consider tossing a coin to support your bartender!
            </motion.p>

            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4"
            >
                <Button onClick={onClose} variant="ghost" className="min-w-[120px]">
                    Maybe Later
                </Button>
                <Button
                    asChild
                    className="min-w-[120px] font-semibold border-none hover:opacity-90"
                    style={{ backgroundColor: "var(--accent-amber)", color: "#14100e" }}
                >
                    <a href={tipLink} target="_blank" rel="noopener noreferrer">
                        <Coffee className="mr-2 h-4 w-4" />
                        Leave a Tip
                    </a>
                </Button>
            </motion.div>
        </div>
    );
}
