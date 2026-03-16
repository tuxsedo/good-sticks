import { useState } from "react";
import { X } from "lucide-react";
import CigarAutocomplete from "@/components/CigarAutocomplete";
import type { CigarEntry } from "@/lib/cigars";

interface FavoriteCigarsStepProps {
  cigars: string[];
  onChange: (cigars: string[]) => void;
}

const FavoriteCigarsStep = ({ cigars, onChange }: FavoriteCigarsStepProps) => {
  const [resetKey, setResetKey] = useState(0);

  const isDuplicate = (name: string) =>
    cigars.some((c) => c.toLowerCase() === name.toLowerCase());

  const addCigar = (name: string) => {
    if (!name || cigars.length >= 3 || isDuplicate(name)) return;
    onChange([...cigars, name]);
    setResetKey((k) => k + 1);
  };

  const handleSelect = (entry: CigarEntry) => addCigar(entry.lineName);
  const handleCustomEntry = (value: string) => addCigar(value);

  const removeCigar = (index: number) => {
    onChange(cigars.filter((_, i) => i !== index));
  };

  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2 text-foreground">
        Name 3 cigars you love.
      </h2>
      <p className="text-muted-foreground text-sm sm:text-base mb-8">
        These help GoodSticks understand your taste. Any cigar you've really enjoyed — doesn't have to be fancy.
      </p>

      <div className="space-y-3 mb-6">
        {cigars.map((cigar, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-primary bg-primary/10 px-4 py-3"
          >
            <span className="text-sm font-medium text-foreground">{cigar}</span>
            <button onClick={() => removeCigar(i)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {cigars.length < 3 && (
        <CigarAutocomplete
          key={resetKey}
          onSelect={handleSelect}
          onCustomEntry={handleCustomEntry}
          placeholder={`Cigar ${cigars.length + 1} of 3 — search by brand or name`}
        />
      )}

      {cigars.length < 3 && (
        <p className="text-xs text-muted-foreground mt-3">
          {3 - cigars.length} more to go
        </p>
      )}
    </div>
  );
};

export default FavoriteCigarsStep;
