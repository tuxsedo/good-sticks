import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  subtext?: string;
}

interface OnboardingStepProps {
  headline: string;
  subtext?: string;
  options: Option[];
  selected: string | string[];
  multiSelect?: boolean;
  onSelect: (value: string) => void;
}

const OnboardingStep = ({
  headline,
  subtext,
  options,
  selected,
  multiSelect = false,
  onSelect,
}: OnboardingStepProps) => {
  const isSelected = (value: string) =>
    multiSelect
      ? (selected as string[]).includes(value)
      : selected === value;

  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2 text-foreground">
        {headline}
      </h2>
      {subtext && (
        <p className="text-muted-foreground text-sm sm:text-base mb-8">{subtext}</p>
      )}
      {!subtext && <div className="mb-8" />}

      <div className={cn(
        "grid gap-3",
        options.length > 6 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"
      )}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              "relative flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-all duration-200 active:scale-[0.98] h-full",
              isSelected(option.value)
                ? "border-primary bg-primary/15 text-foreground scale-[1.01] shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]"
                : "border-border/60 bg-secondary/60 text-foreground hover:border-primary/50 hover:bg-secondary/80"
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className="font-medium text-sm sm:text-base">{option.label}</span>
              {isSelected(option.value) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
            {option.subtext && (
              <span className="text-xs text-muted-foreground mt-0.5">{option.subtext}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OnboardingStep;
