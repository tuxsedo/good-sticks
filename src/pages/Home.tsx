import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Flame, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PalateProfile } from "@/lib/types";

const CIGARS = [
  // Mild
  { name: "Arturo Fuente 8-5-8", brand: "Arturo Fuente", strength: "Mild", notes: "Cedar, cream, natural sweetness, nuts" },
  { name: "Macanudo Café", brand: "Macanudo", strength: "Mild", notes: "Cream, floral, cedar, nuts" },
  { name: "Davidoff Grand Cru", brand: "Davidoff", strength: "Mild", notes: "Cream, floral, white pepper" },
  { name: "Oliva Connecticut Reserve", brand: "Oliva", strength: "Mild", notes: "Cream, cedar, floral, natural sweetness" },
  // Mild-Medium
  { name: "Perdomo Champagne", brand: "Perdomo", strength: "Mild-Medium", notes: "Cream, natural sweetness, cedar, nuts" },
  { name: "Arturo Fuente Hemingway", brand: "Arturo Fuente", strength: "Mild-Medium", notes: "Cedar, cream, natural sweetness, floral" },
  { name: "Romeo y Julieta 1875", brand: "Romeo y Julieta", strength: "Mild-Medium", notes: "Cedar, leather, floral, cream" },
  // Medium
  { name: "Flor de las Antillas", brand: "My Father", strength: "Medium", notes: "Earth, cedar, coffee, cream" },
  { name: "Drew Estate Undercrown", brand: "Drew Estate", strength: "Medium", notes: "Coffee, earth, spice, leather" },
  { name: "Crowned Heads Four Kicks", brand: "Crowned Heads", strength: "Medium", notes: "Cedar, earth, coffee, cream" },
  { name: "Tatuaje Tattoo", brand: "Tatuaje", strength: "Medium", notes: "Earth, spice, leather, dark chocolate" },
  { name: "Illusione Epernay", brand: "Illusione", strength: "Medium", notes: "Cedar, cream, floral, natural sweetness" },
  // Medium-Full
  { name: "Padrón 1964 Anniversary", brand: "Padrón", strength: "Medium-Full", notes: "Dark chocolate, espresso, cedar, earth" },
  { name: "Illusione Rothschild", brand: "Illusione", strength: "Medium-Full", notes: "Earth, spice, dark chocolate, coffee" },
  { name: "Crowned Heads Jericho Hill", brand: "Crowned Heads", strength: "Medium-Full", notes: "Leather, earth, pepper, dark chocolate" },
  { name: "Perdomo 10th Anniversary", brand: "Perdomo", strength: "Medium-Full", notes: "Cedar, dark chocolate, coffee, earth" },
  // Full
  { name: "La Flor Dominicana Double Ligero", brand: "La Flor Dominicana", strength: "Full", notes: "Pepper, earth, leather, spice" },
  { name: "Oliva Serie V Melanio", brand: "Oliva", strength: "Full", notes: "Earth, dark chocolate, pepper, coffee" },
  { name: "My Father Le Bijou 1922", brand: "My Father", strength: "Full", notes: "Dark chocolate, coffee, spice, earth" },
  { name: "Liga Privada No. 9", brand: "Drew Estate", strength: "Full", notes: "Leather, earth, dark chocolate, pepper" },
  { name: "Joya de Nicaragua Antaño", brand: "Joya de Nicaragua", strength: "Full", notes: "Pepper, spice, earth, leather, coffee" },
];

const FLAVOR_LABELS: Record<string, string> = {
  cedar: "Cedar", leather: "Leather", coffee: "Coffee",
  dark_chocolate: "Dark Chocolate", nuts: "Nuts / Almonds", spice: "Spice",
  earth: "Earth", cream: "Cream", pepper: "Black Pepper",
  fruit: "Dried Fruit", floral: "Floral", sweet: "Natural Sweetness",
};

const STRENGTH_LABELS: Record<string, string> = {
  mild: "Mild", mild_medium: "Mild-Medium", medium: "Medium",
  medium_full: "Medium-Full", full: "Full",
};

// Palate flavor keys → keywords to match against cigar notes
const FLAVOR_KEYWORDS: Record<string, string[]> = {
  cedar: ["cedar"], leather: ["leather"], coffee: ["coffee", "espresso"],
  dark_chocolate: ["chocolate", "cocoa", "espresso"], nuts: ["nuts", "almond"],
  spice: ["spice"], earth: ["earth"], cream: ["cream", "butter"],
  pepper: ["pepper"], fruit: ["fruit"], floral: ["floral"],
  sweet: ["sweet", "sweetness"],
};

const STRENGTH_SCALE: Record<string, number> = {
  "Mild": 1, "Mild-Medium": 2, "Medium": 3, "Medium-Full": 4, "Full": 5,
};
const PALATE_STRENGTH_SCALE: Record<string, number> = {
  mild: 1, mild_medium: 2, medium: 3, medium_full: 4, full: 5,
};

function scoreCigar(cigar: (typeof CIGARS)[number], palate: PalateProfile): number {
  let score = 0;
  const notesLower = cigar.notes.toLowerCase();

  const cigarLevel = STRENGTH_SCALE[cigar.strength] ?? 3;
  const palateLevel = PALATE_STRENGTH_SCALE[palate.strength] ?? 3;
  const diff = Math.abs(cigarLevel - palateLevel);
  if (diff === 0) score += 4;
  else if (diff === 1) score += 2;

  for (const flavor of palate.loveFlavors) {
    const keywords = FLAVOR_KEYWORDS[flavor] ?? [flavor];
    if (keywords.some((kw) => notesLower.includes(kw))) score += 2;
  }

  for (const flavor of palate.dislikeFlavors) {
    const keywords = FLAVOR_KEYWORDS[flavor] ?? [flavor];
    if (keywords.some((kw) => notesLower.includes(kw))) score -= 6;
  }

  return score;
}

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

  const rankedCigars = palate
    ? [...CIGARS]
        .map((c) => ({ ...c, score: scoreCigar(c, palate) }))
        .filter((c) => c.score >= 0)
        .sort((a, b) => b.score - a.score)
    : CIGARS;

  const filteredCigars = search.trim()
    ? rankedCigars.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.brand.toLowerCase().includes(search.toLowerCase()) ||
          c.notes.toLowerCase().includes(search.toLowerCase())
      )
    : rankedCigars;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 border-b border-border/50">
        <h1 className="font-display text-2xl font-semibold text-foreground mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          {palate
            ? `Based on your palate — ${STRENGTH_LABELS[palate.strength] ?? palate.strength} body, ${palate.loveFlavors.slice(0, 3).map((f) => FLAVOR_LABELS[f] ?? f).join(", ")} lover`
            : "Discover cigars tailored to your taste"}
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
            className="w-full rounded-xl border border-border bg-secondary/30 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            {search.trim() ? "Search Results" : palate ? "Matched to Your Palate" : "Recommended for You"}
          </h2>
        </div>

        {filteredCigars.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No cigars found matching &ldquo;{search}&rdquo;. Try asking Ember for help.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCigars.map((cigar) => (
              <div
                key={cigar.name}
                className="rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/30 transition-colors group"
              >
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
            ))}
          </div>
        )}

        {/* CTA to Ember */}
        <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="text-sm font-semibold text-foreground">Need a personalized pick?</p>
            <p className="text-xs text-muted-foreground">Ask Ember, your cigar sidekick</p>
          </div>
          <Button variant="ember" size="sm" className="sm:ml-auto shrink-0 w-full sm:w-auto" onClick={() => navigate("/chat")}>
            Chat with Ember
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
