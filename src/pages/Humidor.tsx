import { useState, useEffect } from "react";
import { Plus, Package, Trash2, Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CigarReviewDialog from "@/components/CigarReviewDialog";
import CigarAutocomplete from "@/components/CigarAutocomplete";
import type { HumidorCigar, CigarReview, Vitola } from "@/lib/types";
import { VITOLA_OPTIONS } from "@/lib/types";
import type { CigarEntry } from "@/lib/cigars";

const Humidor = () => {
  const [cigars, setCigars] = useState<HumidorCigar[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [vitola, setVitola] = useState<Vitola | "">("");
  const [quantity, setQuantity] = useState(1);
  const [reviewCigar, setReviewCigar] = useState<HumidorCigar | null>(null);
  // Vitola options for the currently selected line (from DB), or fall back to full list
  const [vitolaOptions, setVitolaOptions] = useState<string[]>([...VITOLA_OPTIONS]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("gs_humidor");
      if (stored) setCigars(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (items: HumidorCigar[]) => {
    setCigars(items);
    localStorage.setItem("gs_humidor", JSON.stringify(items));
  };

  // Called when user picks a line from the autocomplete dropdown
  const handleCigarSelect = (entry: CigarEntry) => {
    setBrand(entry.brand);
    setName(entry.displayLineName);
    setVitola(""); // reset so user picks the specific vitola for this line
    // Populate vitola dropdown with shapes available for this line
    const shapes = entry.vitolaShapes.length > 0 ? entry.vitolaShapes : [...VITOLA_OPTIONS];
    setVitolaOptions(shapes);
  };

  const addCigar = () => {
    if (!name.trim() || !brand.trim()) return;
    const item: HumidorCigar = {
      id: Date.now().toString(),
      brand: brand.trim(),
      name: name.trim(),
      vitola: vitola || undefined,
      quantity,
      addedAt: new Date().toISOString(),
    };
    save([item, ...cigars]);
    setBrand("");
    setName("");
    setVitola("");
    setQuantity(1);
    setVitolaOptions([...VITOLA_OPTIONS]);
    setShowForm(false);
  };

  const removeCigar = (id: string) => save(cigars.filter((c) => c.id !== id));

  const saveReview = (review: CigarReview) => {
    if (!reviewCigar) return;
    const updated = cigars.map((c) =>
      c.id === reviewCigar.id
        ? { ...c, reviews: [...(c.reviews || []), review] }
        : c
    );
    save(updated);
    setReviewCigar(null);
  };

  const avgRating = (cigar: HumidorCigar) => {
    if (!cigar.reviews?.length) return null;
    const avg = cigar.reviews.reduce((s, r) => s + r.rating, 0) / cigar.reviews.length;
    return avg.toFixed(1);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-6 border-b border-border/50 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            My Humidor
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track what's in your collection
          </p>
        </div>
        <Button variant="ember" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Cigar
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {showForm && (
          <div className="rounded-xl border border-primary/30 bg-card/50 p-4 mb-4 space-y-3 animate-fade-in">
            {/* Row 1: autocomplete spans 2 cols, vitola + qty fill the rest */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Cigar search — fills brand + name on selection */}
              <div className="sm:col-span-2">
                <CigarAutocomplete
                  onSelect={handleCigarSelect}
                  initialValue={name}
                  placeholder="Search brand or line…"
                />
              </div>

              {/* Vitola — shows line-specific shapes after a selection, full list otherwise */}
              <Select value={vitola} onValueChange={(v) => setVitola(v as Vitola)}>
                <SelectTrigger className="rounded-lg border-border bg-secondary/30 text-sm h-[42px]">
                  <SelectValue placeholder="Vitola (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {vitolaOptions.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                placeholder="Qty"
                className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>

            {/* Show selected brand/name as confirmation when filled */}
            {brand && name && (
              <p className="text-xs text-muted-foreground px-1">
                <span className="text-primary font-medium">{brand}</span>
                {" · "}
                {name}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="ember"
                size="sm"
                disabled={!name.trim() || !brand.trim()}
                onClick={addCigar}
              >
                Add to Humidor
              </Button>
              <Button
                variant="ember-ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setBrand("");
                  setName("");
                  setVitola("");
                  setVitolaOptions([...VITOLA_OPTIONS]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {cigars.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <Package className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Your humidor is empty.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add cigars you own to keep track of your collection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 text-left">
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cigar
                  </th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Vitola
                  </th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Added
                  </th>
                  <th className="pb-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {cigars.map((cigar) => {
                  const avg = avgRating(cigar);
                  return (
                    <tr
                      key={cigar.id}
                      className="border-b border-border/30 group hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-3 text-sm text-foreground/80">
                        {cigar.brand}
                      </td>
                      <td className="py-3 text-sm font-medium text-foreground">
                        {cigar.name}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {cigar.vitola}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {cigar.quantity ?? 1}
                      </td>
                      <td className="py-3 text-sm">
                        {avg ? (
                          <span className="flex items-center gap-1 text-primary">
                            <Star className="h-3.5 w-3.5 fill-primary" />
                            {avg}
                            <span className="text-muted-foreground/50 text-xs">
                              ({cigar.reviews!.length})
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">
                            No reviews
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {format(new Date(cigar.addedAt), "MMM d, yyyy")}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setReviewCigar(cigar)}
                            className="text-muted-foreground/50 hover:text-primary transition-colors p-1"
                            title="Write a review"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeCigar(cigar.id)}
                            className="text-muted-foreground/30 hover:text-foreground transition-colors p-1"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewCigar && (
        <CigarReviewDialog
          cigar={reviewCigar}
          open={!!reviewCigar}
          onOpenChange={(open) => !open && setReviewCigar(null)}
          onSave={saveReview}
        />
      )}
    </div>
  );
};

export default Humidor;
