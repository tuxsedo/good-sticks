import { useState, useEffect } from "react";
import { X, Plus, Star, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CigarItem } from "@/lib/types";

interface CigarSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tab = "wishlist" | "humidor";

const CigarSidebar = ({ open, onOpenChange }: CigarSidebarProps) => {
  const [tab, setTab] = useState<Tab>("wishlist");
  const [wishlist, setWishlist] = useState<CigarItem[]>([]);
  const [humidor, setHumidor] = useState<CigarItem[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    try {
      const w = localStorage.getItem("gs_wishlist");
      const h = localStorage.getItem("gs_humidor");
      if (w) setWishlist(JSON.parse(w));
      if (h) setHumidor(JSON.parse(h));
    } catch {}
  }, []);

  const save = (key: string, items: CigarItem[]) => {
    localStorage.setItem(key, JSON.stringify(items));
  };

  const addItem = () => {
    const name = input.trim();
    if (!name) return;
    const item: CigarItem = { id: Date.now().toString(), name, addedAt: new Date().toISOString() };
    if (tab === "wishlist") {
      const updated = [...wishlist, item];
      setWishlist(updated);
      save("gs_wishlist", updated);
    } else {
      const updated = [...humidor, item];
      setHumidor(updated);
      save("gs_humidor", updated);
    }
    setInput("");
  };

  const removeItem = (id: string) => {
    if (tab === "wishlist") {
      const updated = wishlist.filter((i) => i.id !== id);
      setWishlist(updated);
      save("gs_wishlist", updated);
    } else {
      const updated = humidor.filter((i) => i.id !== id);
      setHumidor(updated);
      save("gs_humidor", updated);
    }
  };

  const items = tab === "wishlist" ? wishlist : humidor;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => onOpenChange(false)} />
      )}
      <div
        className={cn(
          "fixed lg:relative z-50 h-full w-80 border-r border-border bg-card flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
          <span className="font-display text-lg font-semibold text-foreground">My Collection</span>
          <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/50">
          <button
            onClick={() => setTab("wishlist")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
              tab === "wishlist"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Star className="h-4 w-4" />
            Wishlist
            {wishlist.length > 0 && (
              <span className="text-xs bg-primary/15 text-primary rounded-full px-1.5">{wishlist.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab("humidor")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
              tab === "humidor"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Package className="h-4 w-4" />
            Humidor
            {humidor.length > 0 && (
              <span className="text-xs bg-primary/15 text-primary rounded-full px-1.5">{humidor.length}</span>
            )}
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {tab === "wishlist"
                ? "Cigars you want to try will appear here."
                : "Add cigars you own to your humidor."}
            </p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2.5"
            >
              <span className="text-sm text-foreground">{item.name}</span>
              <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add input */}
        <div className="border-t border-border/50 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder={`Add to ${tab}...`}
              className="flex-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <Button variant="ember" size="icon" className="h-9 w-9 rounded-lg" disabled={!input.trim()} onClick={addItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CigarSidebar;
