import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-zinc-900/60 p-5 rounded-[20px] shadow-sm border border-white/10",
        className,
      )}
    >
      {children}
    </div>
  );
}
