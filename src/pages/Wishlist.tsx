import { useState, useEffect } from "react";
import { Plus, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VITOLA_OPTIONS, type WishlistCigar, type Vitola } from "@/lib/types";

const Wishlist = () => {
  const [cigars, setCigars] = useState<WishlistCigar[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [vitola, setVitola] = useState<Vitola | "">("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("gs_wishlist");
      if (stored) setCigars(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (items: WishlistCigar[]) => {
    setCigars(items);
    localStorage.setItem("gs_wishlist", JSON.stringify(items));
  };

  const addCigar = () => {
    if (!name.trim()) return;
    const item: WishlistCigar = {
      id: Date.now().toString(),
      brand: brand.trim(),
      name: name.trim(),
      vitola: vitola.trim() || undefined,
      addedAt: new Date().toISOString(),
    };
    save([item, ...cigars]);
    setBrand("");
    setName("");
    setVitola("");
    setShowForm(false);
  };

  const removeCigar = (id: string) => {
    save(cigars.filter((c) => c.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-6 border-b border-border/50 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Wishlist
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Cigars you want to try</p>
        </div>
        <Button variant="ember" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Cigar
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {showForm && (
          <div className="rounded-xl border border-primary/30 bg-card/50 p-4 mb-4 space-y-3 animate-fade-in">
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Brand (e.g. Padrón)"
                className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cigar name *"
                className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <input
                type="text"
                value={vitola}
                onChange={(e) => setVitola(e.target.value)}
                placeholder="Vitola (optional)"
                className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ember" size="sm" disabled={!name.trim()} onClick={addCigar}>
                Add to Wishlist
              </Button>
              <Button variant="ember-ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {cigars.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <Star className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No cigars on your wishlist yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add cigars you want to try, or ask Ember to suggest some.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cigars.map((cigar) => (
              <div
                key={cigar.id}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 px-4 py-3 group hover:border-primary/20 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{cigar.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[cigar.brand, cigar.vitola].filter(Boolean).join(" · ") || "No details"}
                  </p>
                </div>
                <button
                  onClick={() => removeCigar(cigar.id)}
                  className="text-muted-foreground/30 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
