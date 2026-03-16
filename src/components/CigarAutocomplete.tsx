import { useState, useRef, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { searchCigars, type CigarEntry } from "@/lib/cigars";

interface CigarAutocompleteProps {
  /** Called when the user selects a line from the dropdown */
  onSelect: (entry: CigarEntry) => void;
  /**
   * Called when the user explicitly confirms a free-text entry
   * that doesn't match anything in the database.
   * If omitted, custom entries are not allowed.
   */
  onCustomEntry?: (value: string) => void;
  /** Optional initial display value */
  initialValue?: string;
  placeholder?: string;
  className?: string;
}

/**
 * Typeahead search across 130+ cigar brands and 246 product lines.
 * On selection, `onSelect` receives the full CigarEntry so the parent
 * can fill brand, name, and vitola fields all at once.
 */
export default function CigarAutocomplete({
  onSelect,
  onCustomEntry,
  initialValue = "",
  placeholder = "Search brand or line…",
  className,
}: CigarAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<CigarEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setResults(searchCigars(query));
    setActiveIndex(-1);
  }, [query, open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(
    (entry: CigarEntry) => {
      // Show "Brand · Line" in the input after selection so user can see both
      setQuery(`${entry.brand} · ${entry.displayLineName}`);
      setOpen(false);
      setResults([]);
      onSelect(entry);
    },
    [onSelect]
  );

  const trimmedQuery = query.trim();
  const showCustomOption =
    onCustomEntry !== undefined && open && trimmedQuery.length >= 3 && results.length === 0;

  const handleCustomEntry = useCallback(() => {
    if (!onCustomEntry || trimmedQuery.length < 3) return;
    setOpen(false);
    setResults([]);
    onCustomEntry(trimmedQuery);
  }, [onCustomEntry, trimmedQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      } else if (showCustomOption) {
        handleCustomEntry();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const strengthBadgeClass: Record<string, string> = {
    "Mild": "text-green-400",
    "Mild-Medium": "text-lime-400",
    "Medium": "text-amber-400",
    "Medium-Full": "text-orange-400",
    "Full": "text-red-400",
  };

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-border bg-secondary/30 pl-8 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Dropdown */}
      {(open && results.length > 0) || showCustomOption ? (
        <ul
          className="absolute left-0 right-0 z-50 mt-1 overflow-y-auto rounded-xl border border-border bg-card shadow-xl"
          style={{ maxHeight: 280 }}
        >
          {results.map((entry, i) => (
            <li
              key={`${entry.brand}-${entry.lineName}`}
              onMouseDown={() => handleSelect(entry)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors ${
                i === activeIndex ? "bg-secondary/60" : "hover:bg-secondary/30"
              }`}
            >
              {/* Primary dot */}
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />

              <div className="min-w-0 flex-1">
                {/* Brand on top, line name below — keeps them visually separate */}
                <p className="truncate text-xs font-semibold uppercase tracking-wide text-primary/70">
                  {entry.brand}
                </p>
                <p className="truncate text-sm font-medium text-foreground">
                  {entry.displayLineName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {entry.wrapper ? entry.wrapper : ""}
                  {entry.country ? ` · ${entry.country}` : ""}
                </p>
              </div>

              {/* Strength badge */}
              <span
                className={`mt-0.5 shrink-0 text-xs font-medium ${
                  strengthBadgeClass[entry.strength] ?? "text-muted-foreground"
                }`}
              >
                {entry.strength}
              </span>
            </li>
          ))}

          {/* Custom entry row — only shown when query has no DB matches */}
          {showCustomOption && (
            <li
              onMouseDown={handleCustomEntry}
              className="flex cursor-pointer items-center gap-3 border-t border-border/50 px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary/30 transition-colors"
            >
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full border border-muted-foreground/40" />
              <span>
                Add <span className="font-medium text-foreground">"{trimmedQuery}"</span> as custom cigar
              </span>
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
