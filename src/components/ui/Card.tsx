import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className = "", hover, glow, padding = "md", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#111113] border border-zinc-800/60 rounded-[8px] ${paddingStyles[padding]} ${hover ? "hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-200 cursor-pointer" : ""} ${glow ? "glow-red" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function CardHeader({ children, className = "", action }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="flex-1 min-w-0">{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`font-display font-semibold text-zinc-100 text-[15px] leading-tight ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-zinc-500 text-sm mt-0.5 ${className}`}>{children}</p>;
}
