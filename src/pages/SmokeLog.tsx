import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Flame, Trash2, MessageSquare, Star, Package } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import CigarAutocomplete from "@/components/CigarAutocomplete";
import type { SmokeLogEntry, HumidorCigar } from "@/lib/types";
import type { CigarEntry } from "@/lib/cigars";
import { useAuth } from "@/contexts/AuthContext";
import { getSmokeLog, addSmokeLog as dbAddSmokeLog, deleteSmokeLog as dbDeleteSmokeLog, getHumidor } from "@/lib/supabase";

// computeInsight: scans cigar name only (not notes — avoids false positives)
function computeInsight(log: SmokeLogEntry[]): string {
  if (log.length < 3) return "";
  const maduros = log.filter((e) => e.name.toLowerCase().includes("maduro"));
  const topRated = log.filter((e) => e.rating >= 4);
  if (maduros.length >= Math.ceil(log.length * 0.5)) {
    return `${maduros.length} of your last ${log.length} smokes have been maduros. That's your tell.`;
  }
  if (topRated.length >= 2) {
    const names = topRated.slice(0, 2).map((e) => `${e.brand} ${e.name}`).join(" and ");
    return `Your top-rated smokes — ${names} — point to a clear profile. Ember knows where to look.`;
  }
  return `You've logged ${log.length} smokes. Keep going — patterns are starting to emerge.`;
}

/** Convert humidor reviews into SmokeLogEntry shape for merged display */
function humidorReviewsToEntries(humidor: HumidorCigar[]): (SmokeLogEntry & { _fromHumidor: true })[] {
  return humidor.flatMap((cigar) =>
    (cigar.reviews ?? []).map((review) => ({
      id: `humidor-${review.id}`,
      brand: cigar.brand,
      name: cigar.name,
      vitola: cigar.vitola as string | undefined,
      rating: review.rating,
      note: review.notes,
      smokedAt: review.reviewedAt,
      draw: review.draw,
      burn: review.burn,
      construction: review.construction,
      _fromHumidor: true as const,
    }))
  );
}

const StarBar = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="p-0.5 transition-transform hover:scale-110"
      >
        <Star
          className={`h-6 w-6 transition-colors ${
            star <= value ? "fill-primary text-primary" : "fill-none text-muted-foreground/30"
          }`}
        />
      </button>
    ))}
  </div>
);

const SmokeLog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Smoke-log entries (from smoke_log table or localStorage)
  const [logEntries, setLogEntries] = useState<SmokeLogEntry[]>([]);
  // Humidor reviews flattened as smoke log entries
  const [humidorEntries, setHumidorEntries] = useState<(SmokeLogEntry & { _fromHumidor: true })[]>([]);

  const [showForm, setShowForm] = useState(false);

  // Form state
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // All entries merged + sorted newest first
  const allEntries = [...logEntries, ...humidorEntries].sort(
    (a, b) => new Date(b.smokedAt).getTime() - new Date(a.smokedAt).getTime()
  );

  const loadAll = useCallback(async () => {
    if (user) {
      const [log, humidor] = await Promise.all([getSmokeLog(), getHumidor()]);
      setLogEntries(log);
      setHumidorEntries(humidorReviewsToEntries(humidor));
    } else {
      try {
        const logRaw = localStorage.getItem("gs_smoke_log");
        if (logRaw) setLogEntries(JSON.parse(logRaw));
        const humidorRaw = localStorage.getItem("gs_humidor");
        if (humidorRaw) setHumidorEntries(humidorReviewsToEntries(JSON.parse(humidorRaw)));
      } catch {}
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveLocalLog = (items: SmokeLogEntry[]) => {
    setLogEntries(items);
    localStorage.setItem("gs_smoke_log", JSON.stringify(items));
  };

  const handleCigarSelect = (entry: CigarEntry) => {
    setBrand(entry.brand);
    setName(entry.displayLineName);
  };

  const resetForm = () => {
    setBrand("");
    setName("");
    setRating(0);
    setNote("");
    setShowForm(false);
  };

  const addEntry = async () => {
    if (!brand.trim() || !name.trim() || rating === 0) return;
    setSaving(true);

    // Build a temp entry for immediate optimistic display
    const tempEntry: SmokeLogEntry = {
      id: `local-${Date.now()}`,
      brand: brand.trim(),
      name: name.trim(),
      rating,
      note: note.trim() || undefined,
      smokedAt: new Date().toISOString(),
    };

    // --- Optimistic update: show immediately regardless of Supabase state ---
    setLogEntries((prev) => [tempEntry, ...prev]);
    // For unauthenticated users, also persist to localStorage right away
    if (!user) {
      const next = [tempEntry, ...logEntries];
      localStorage.setItem("gs_smoke_log", JSON.stringify(next));
    }

    setSaving(false);
    resetForm();

    // --- Background Supabase sync for authenticated users ---
    if (user) {
      const created = await dbAddSmokeLog({
        brand: tempEntry.brand,
        name: tempEntry.name,
        rating: tempEntry.rating,
        note: tempEntry.note,
      });
      if (created) {
        // Swap temp entry for the real DB record (gets a proper UUID)
        setLogEntries((prev) => prev.map((e) => (e.id === tempEntry.id ? created : e)));
      }
      // If Supabase failed (table missing, RLS error, etc.), the entry remains
      // visible via optimistic state — user isn't blocked.
    }
  };

  const removeEntry = async (id: string) => {
    if (user) {
      await dbDeleteSmokeLog(id);
    }
    setLogEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      if (!user) localStorage.setItem("gs_smoke_log", JSON.stringify(next));
      return next;
    });
  };

  const insight = computeInsight(allEntries);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 border-b border-border/50 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Smoke Log
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            What you've smoked and how it landed
          </p>
        </div>
        <Button variant="ember" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Log a Smoke
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Insight banner */}
        {insight ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground/80 flex items-start gap-2">
            <Flame className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>{insight}</span>
          </div>
        ) : allEntries.length < 3 ? (
          <div className="rounded-xl border border-border/40 bg-secondary/20 px-4 py-3 text-sm text-muted-foreground flex items-start gap-2">
            <Flame className="h-4 w-4 text-primary/40 mt-0.5 flex-shrink-0" />
            <span>
              Log {Math.max(0, 3 - allEntries.length)} more smoke{3 - allEntries.length !== 1 ? "s" : ""} and Ember will start to see your pattern.
            </span>
          </div>
        ) : null}

        {/* Add form */}
        {showForm && (
          <div className="rounded-xl border border-primary/30 bg-card/50 p-4 space-y-3 animate-fade-in">
            <CigarAutocomplete
              onSelect={handleCigarSelect}
              initialValue={name}
              placeholder="Search brand or line…"
            />

            {brand && name && (
              <p className="text-xs text-muted-foreground px-1">
                <span className="text-primary font-medium">{brand}</span>
                {" · "}
                {name}
              </p>
            )}

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Rating</p>
              <StarBar value={rating} onChange={setRating} />
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tasting notes (optional)…"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />

            <div className="flex gap-2">
              <Button
                variant="ember"
                size="sm"
                disabled={!brand.trim() || !name.trim() || rating === 0 || saving}
                onClick={addEntry}
              >
                Save Smoke
              </Button>
              <Button variant="ember-ghost" size="sm" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {allEntries.length === 0 && !showForm ? (
          <div className="text-center py-20 px-4">
            <Flame className="h-12 w-12 text-primary/20 mx-auto mb-4" />
            <p className="text-base font-medium text-foreground mb-1">
              No smokes logged yet.
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
              Rate what you smoke and Ember learns your pattern — then gives you recommendations that actually fit.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="ember" size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Log your first smoke
              </Button>
              <Button variant="ember-ghost" size="sm" onClick={() => navigate("/chat")}>
                <MessageSquare className="h-4 w-4 mr-1" />
                Ask Ember for a recommendation
              </Button>
            </div>
          </div>
        ) : allEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 text-left">
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Brand</th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cigar</th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rating</th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Note</th>
                  <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="pb-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {allEntries.map((entry) => {
                  const fromHumidor = "_fromHumidor" in entry && entry._fromHumidor;
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-border/30 group hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-3 text-sm text-foreground/80">{entry.brand}</td>
                      <td className="py-3 text-sm font-medium text-foreground">
                        <span className="flex items-center gap-1.5">
                          {entry.name}
                          {fromHumidor && (
                            <span
                              title="Rated in My Humidor"
                              className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium bg-secondary/60 text-muted-foreground"
                            >
                              <Package className="h-2.5 w-2.5" />
                              humidor
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 text-sm">
                        <span className="flex items-center gap-1 text-primary">
                          <Star className="h-3.5 w-3.5 fill-primary" />
                          {entry.rating}/5
                        </span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                        {entry.note ?? <span className="text-muted-foreground/30">—</span>}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(entry.smokedAt), "MMM d, yyyy")}
                      </td>
                      <td className="py-3">
                        {!fromHumidor && (
                          <button
                            onClick={() => removeEntry(entry.id)}
                            className="text-muted-foreground/30 hover:text-foreground transition-colors p-1 opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SmokeLog;
