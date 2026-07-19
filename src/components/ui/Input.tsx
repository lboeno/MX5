import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, required, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            className={`w-full h-10 px-3.5 bg-zinc-900 border rounded-[6px] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-800 transition-colors ${
              icon ? "pl-10" : ""
            } ${
              error ? "border-red-800 focus:border-red-700" : "border-zinc-700"
            } ${className}`}
            {...props}
          />
          
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {icon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-[11px] text-red-500 mt-1.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";