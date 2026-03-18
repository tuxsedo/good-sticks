import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Flame, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PalateProfile } from "@/lib/types";

const RECOMMENDED_CIGARS = [
{ name: "Padrón 1964 Anniversary", brand: "Padrón", strength: "Medium-Full", notes: "Chocolate, espresso, cedar" },
{ name: "Oliva Serie V Melanio", brand: "Oliva", strength: "Full", notes: "Earth, dark chocolate, pepper" },
{ name: "Arturo Fuente Hemingway", brand: "Arturo Fuente", strength: "Medium", notes: "Cedar, cream, natural sweetness" },
{ name: "My Father Le Bijou 1922", brand: "My Father", strength: "Full", notes: "Dark chocolate, coffee, spice" },
{ name: "Davidoff Grand Cru", brand: "Davidoff", strength: "Mild-Medium", notes: "Cream, floral, white pepper" },
{ name: "Liga Privada No. 9", brand: "Drew Estate", strength: "Full", notes: "Leather, earth, dark cocoa" }];


const Home = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const palate: PalateProfile | null = (() => {
    try {
      const stored = localStorage.getItem("gs_palate");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const filteredCigars = search.trim() ?
  RECOMMENDED_CIGARS.filter(
    (c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.brand.toLowerCase().includes(search.toLowerCase()) ||
    c.notes.toLowerCase().includes(search.toLowerCase())
  ) :
  RECOMMENDED_CIGARS;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 border-b border-border/50">
        <h1 className="font-display text-2xl font-semibold text-foreground mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          {palate ?
          `Based on your palate. ${palate.strength} body, ${palate.loveFlavors.slice(0, 3).join(", ")} lover` :
          "Discover cigars tailored to your taste"}
        </p>
      </div>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cigars by name, brand, or flavor..."
            className="w-full rounded-xl border border-border bg-secondary/30 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
          
        </div>
      </div>

      {/* Recommendations */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            {search.trim() ? "Search Results" : "Recommended for You"}
          </h2>
        </div>

        {filteredCigars.length === 0 ?
        <p className="text-sm text-muted-foreground py-8 text-center">
            No cigars found matching "{search}". Try asking Ember for help.
          </p> :

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCigars.map((cigar) =>
          <div
            key={cigar.name}
            className="rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/30 transition-colors group">
            
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cigar.name}</p>
                    <p className="text-xs text-muted-foreground">{cigar.brand}</p>
                  </div>
                  <button className="text-muted-foreground/30 hover:text-primary transition-colors">
                    <Star className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">
                    {cigar.strength}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{cigar.notes}</p>
              </div>
          )}
          </div>
        }

        {/* CTA to Ember */}
        <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-4">
          <p className="text-sm font-semibold text-foreground whitespace-nowrap">Need a personalized pick?</p>
          <p className="text-xs text-muted-foreground whitespace-nowrap">Ask Ember, your cigar sidekick</p>
          <Button variant="ember" size="sm" className="ml-auto shrink-0" onClick={() => navigate("/chat")}>
            Chat with Ember
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>);

};

export default Home;