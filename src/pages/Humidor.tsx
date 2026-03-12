import { useState, useEffect } from "react";
import { Plus, X, Package } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { HumidorCigar } from "@/lib/types";

const Humidor = () => {
  const [cigars, setCigars] = useState<HumidorCigar[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [vitola, setVitola] = useState("");

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

  const addCigar = () => {
    if (!name.trim() || !brand.trim()) return;
    const item: HumidorCigar = {
      id: Date.now().toString(),
      brand: brand.trim(),
      name: name.trim(),
      vitola: vitola.trim() || "—",
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
            <Package className="h-5 w-5 text-primary" />
            My Humidor
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track what's in your collection</p>
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
                placeholder="Brand *"
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
                placeholder="Vitola (e.g. Robusto)"
                className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ember" size="sm" disabled={!name.trim() || !brand.trim()} onClick={addCigar}>
                Add to Humidor
              </Button>
              <Button variant="ember-ghost" size="sm" onClick={() => setShowForm(false)}>
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
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Brand</th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cigar</th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vitola</th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Added</th>
                  <th className="pb-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {cigars.map((cigar) => (
                  <tr key={cigar.id} className="border-b border-border/30 group hover:bg-secondary/20 transition-colors">
                    <td className="py-3 text-sm text-foreground/80">{cigar.brand}</td>
                    <td className="py-3 text-sm font-medium text-foreground">{cigar.name}</td>
                    <td className="py-3 text-sm text-muted-foreground">{cigar.vitola}</td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {format(new Date(cigar.addedAt), "MMM d, yyyy")}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => removeCigar(cigar.id)}
                        className="text-muted-foreground/30 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Humidor;
