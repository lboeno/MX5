import { type ReactNode } from "react";
import { Check } from "lucide-react";

interface StepperProps {
  steps: { label: string; icon: ReactNode }[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-muted" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-rose-600 transition-all duration-300" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? "bg-rose-600 border-rose-600 text-white"
                    : isCurrent
                    ? "bg-card border-rose-600 text-rose-500"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
              </div>
              <span 
                className={`text-xs mt-2 font-medium hidden md:block ${
                  isCurrent ? "text-rose-500" : isCompleted ? "text-foreground/80" : "text-muted-foreground/70"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1 px-5">
        {steps.map((_, index) => (
          <div key={index} className="hidden md:block text-[10px] text-muted-foreground/70 text-center w-20">
            {index === 0 && "Dados"}
            {index === 1 && "Emergência"}
            {index === 2 && "Competição"}
            {index === 3 && "Documentos"}
            {index === 4 && "Médico"}
            {index === 5 && "Extras"}
            {index === 6 && "Aceites"}
          </div>
        ))}
      </div>
    </div>
  );
}