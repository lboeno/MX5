import { type ReactNode, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-rose-600 hover:bg-rose-500 text-white border-rose-600 hover:border-rose-500 shadow-[0_0_16px_rgba(225,29,72,0.25)] hover:shadow-[0_0_24px_rgba(225,29,72,0.4)]",
  secondary: "bg-muted hover:bg-secondary text-foreground border-border hover:border-border",
  ghost: "bg-transparent hover:bg-muted text-foreground/80 hover:text-foreground border-transparent",
  danger: "bg-red-900 hover:bg-red-800 text-red-100 border-red-800",
  outline: "bg-transparent hover:bg-muted/50 text-foreground/80 border-border hover:border-border",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-sm gap-2.5",
};

export function Button({
  children,
  variant = "secondary",
  size = "md",
  loading,
  icon,
  iconRight,
  fullWidth,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium border rounded-[5px] transition-all duration-150 cursor-pointer select-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0 w-4 h-4">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && <span className="flex-shrink-0 w-4 h-4">{iconRight}</span>}
    </button>
  );
}
