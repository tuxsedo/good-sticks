import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteCigarsStepProps {
  cigars: string[];
  onChange: (cigars: string[]) => void;
}

const FavoriteCigarsStep = ({ cigars, onChange }: FavoriteCigarsStepProps) => {
  const [input, setInput] = useState("");

  const addCigar = () => {
    const name = input.trim();
    if (!name || cigars.length >= 3) return;
    if (!cigars.includes(name)) {
      onChange([...cigars, name]);
    }
    setInput("");
  };

  const removeCigar = (index: number) => {
    onChange(cigars.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCigar();
    }
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
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Cigar ${cigars.length + 1} of 3 — e.g. "Padrón 1964"`}
            className="flex-1 rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <Button
            variant="ember"
            size="icon"
            className="h-11 w-11 rounded-lg flex-shrink-0"
            disabled={!input.trim()}
            onClick={addCigar}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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
