import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { CigarReview, HumidorCigar } from "@/lib/types";

const FLAVOR_LABELS: { key: keyof CigarReview["flavors"]; label: string }[] = [
  { key: "strength", label: "Strength" },
  { key: "body", label: "Body" },
  { key: "sweetness", label: "Sweetness" },
  { key: "spice", label: "Spice" },
  { key: "earthiness", label: "Earthiness" },
];

const SMOKE_LABELS = [
  { key: "draw" as const, label: "Draw" },
  { key: "burn" as const, label: "Burn" },
  { key: "construction" as const, label: "Construction" },
];

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="transition-colors"
      >
        <Star
          className={`h-6 w-6 ${
            star <= value
              ? "fill-primary text-primary"
              : "text-muted-foreground/30"
          }`}
        />
      </button>
    ))}
  </div>
);

interface Props {
  cigar: HumidorCigar;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (review: CigarReview) => void;
}

const emptyFlavors = (): CigarReview["flavors"] => ({
  strength: 0,
  body: 0,
  sweetness: 0,
  spice: 0,
  earthiness: 0,
  woodiness: 0,
  creaminess: 0,
  nuttiness: 0,
  leather: 0,
  pepper: 0,
  cocoa: 0,
  coffee: 0,
  fruit: 0,
  floral: 0,
});

const CigarReviewDialog = ({ cigar, open, onOpenChange, onSave }: Props) => {
  const [rating, setRating] = useState(0);
  const [draw, setDraw] = useState(0);
  const [burn, setBurn] = useState(0);
  const [construction, setConstruction] = useState(0);
  const [flavors, setFlavors] = useState<CigarReview["flavors"]>(emptyFlavors());
  const [notes, setNotes] = useState("");

  const setFlavor = (key: keyof CigarReview["flavors"], val: number) =>
    setFlavors((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (rating === 0) return;
    const review: CigarReview = {
      id: Date.now().toString(),
      rating,
      draw,
      burn,
      construction,
      flavors,
      notes: notes.trim() || undefined,
      reviewedAt: new Date().toISOString(),
    };
    onSave(review);
    // Reset
    setRating(0);
    setDraw(0);
    setBurn(0);
    setConstruction(0);
    setFlavors(emptyFlavors());
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-foreground">
            Review: {cigar.brand} {cigar.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {cigar.vitola} · Rate your experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Overall Rating */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Overall Rating *
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Smoke Quality */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Smoke Quality
            </label>
            <div className="space-y-3">
              {SMOKE_LABELS.map(({ key, label }) => {
                const val = key === "draw" ? draw : key === "burn" ? burn : construction;
                const setter = key === "draw" ? setDraw : key === "burn" ? setBurn : setConstruction;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-28 shrink-0">
                      {label}
                    </span>
                    <Slider
                      min={0}
                      max={5}
                      step={1}
                      value={[val]}
                      onValueChange={([v]) => setter(v)}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-6 text-right">
                      {val > 0 ? val : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flavor Profile */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Flavor Profile
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Score each note from 0 (absent) to 5 (dominant). Leave at 0 to skip.
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {FLAVOR_LABELS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-28 shrink-0">
                    {label}
                  </span>
                  <Slider
                    min={0}
                    max={5}
                    step={1}
                    value={[flavors[key]]}
                    onValueChange={([v]) => setFlavor(key, v)}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-6 text-right">
                    {flavors[key] > 0 ? flavors[key] : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Tasting Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was the smoke? Any memorable moments?"
              rows={3}
              className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="ember"
            size="sm"
            disabled={rating === 0}
            onClick={handleSave}
          >
            Save Review
          </Button>
          <Button
            variant="ember-ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CigarReviewDialog;
