import { Card } from "@/components/ui/Card";

export interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  return (
    <Card
      variant="default"
      className={`border-amber-900/40 bg-amber-950/20 px-4 py-3 text-[var(--text-cream-muted)] ${className}`}
      role="alert"
    >
      <p className="text-sm">{message}</p>
    </Card>
  );
}
