import { forwardRef, type InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, required, className = "", ...props }, ref) => {
    return (
      <label className={`flex items-center gap-2 cursor-pointer group ${className}`}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded border-2 transition-all ${
              props.checked
                ? "bg-rose-600 border-rose-600"
                : "bg-zinc-900 border-zinc-700 group-hover:border-zinc-600"
            }`}
          >
            {props.checked && (
              <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <span className="text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";