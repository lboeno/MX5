import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline" | "ghost";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-muted text-foreground/80 border-border",
  success: "bg-emerald-950 text-emerald-400 border-emerald-800",
  warning: "bg-amber-950 text-amber-400 border-amber-800",
  danger: "bg-rose-950 text-rose-400 border-rose-800",
  info: "bg-blue-950 text-blue-400 border-blue-800",
  outline: "bg-transparent text-foreground/80 border-border",
  ghost: "bg-transparent text-muted-foreground border-transparent",
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-muted-foreground",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-rose-400",
  info: "bg-blue-400",
  outline: "bg-muted-foreground",
  ghost: "bg-muted-foreground",
};

export function Badge({ children, variant = "default", size = "sm", dot, className = "" }: BadgeProps) {
  const sizeStyles = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium border rounded-[3px] tracking-wide uppercase ${sizeStyles} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotStyles[variant]} ${variant === "success" ? "live-dot" : ""}`} />
      )}
      {children}
    </span>
  );
}
