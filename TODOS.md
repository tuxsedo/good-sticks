# TODOS

## Deferred from Smoke Log feature (2026-03-21)

### Unified Ratings Tab
**What:** A `/ratings` page showing all user ratings across both the smoke log and humidor reviews in one list.
**Why:** Users may rate a cigar without it being in their humidor (smoked a friend's, at a shop, etc). Having ratings siloed in Humidor reviews OR Smoke Log means no single place to see "everything I've rated."
**Context:** The app now has two entry points for ratings: `CigarReview` in humidor (1-5, with optional sub-scores) and `SmokeLogEntry.rating` (1-5). A unified view would query both and merge by cigar name/brand. This is the "Vivino ratings" UX moment.
**Pros:** High-value UX; makes the app feel complete; shareable
**Cons:** Requires merging two data shapes; brand/name normalization matters
**Depends on:** Smoke Log feature shipping first

---

### Smoke Log Migration on Sign-in
**What:** When an unauthenticated user signs in for the first time, migrate their `gs_smoke_log` localStorage entries to Supabase (same as the existing humidor/wishlist migration in `migrateFromLocalStorage`).
**Why:** Users who log smokes before signing up will lose their history silently if we don't migrate it.
**Context:** `migrateFromLocalStorage()` in `src/lib/supabase.ts` already handles humidor and wishlist. Add smoke log to the same function. Simple incremental change.
**Pros:** No data loss; consistent with existing migration pattern
**Cons:** Small risk of duplicates if migration runs twice (add deduplication guard)
**Depends on:** Smoke Log feature shipping first

---

### Claude-generated Insight Banner (v2)
**What:** Replace the client-side `computeInsight()` function with a dedicated Claude API call that generates the insight copy from the smoke history.
**Why:** Client-side keyword matching is brittle. Claude can synthesize actual patterns: "You've been gravitating toward full-bodied Nicaraguan puros with earthy notes — 4 of your last 6 smokes fit this profile."
**Context:** v1 uses simple keyword detection (name contains "maduro") which works for common cases but misses subtlety. A v2 call could pass the last 10 smokes to a short Claude prompt and get back one sentence of insight copy. ~100 tokens, cheap.
**Pros:** Better insights; handles edge cases the keyword logic misses
**Cons:** Extra API latency on /log page load; needs caching to avoid re-generating on every visit
**Depends on:** Smoke Log feature shipping; real user data to tune the prompt

---

### Optional Sub-ratings in Smoke Log Modal
**What:** After logging a smoke (brand, name, rating), offer an "Add more detail" expansion with optional sub-ratings: draw (1-5), burn (1-5), construction (1-5), flavor notes.
**Why:** The design chose 1-5 simple rating to reduce friction, but power users (veteran profile) may want to capture more. This is the Vivino "advanced" rating flow.
**Context:** `CigarReview` type already has all the sub-fields. The smoke log modal would just need an expandable section that maps to the same fields.
**Pros:** Satisfies power users; no friction for casual users; data feeds Ember's pattern synthesis
**Cons:** Modal complexity; need to decide whether sub-ratings are stored in smoke_log or a separate table
**Depends on:** Smoke Log feature shipping

---

### Smoke Log Duration Field
**What:** Add an optional duration field to smoke log entries (30 min / 1 hr / 1.5 hr / 2 hr+).
**Why:** "Your typical evening smoke runs 90 minutes" is a useful pattern for Ember to reference when a user says they have limited time.
**Context:** Not included in v1 schema to keep the modal lean. Adding it later requires a Supabase ALTER TABLE migration.
**Pros:** Enables time-based recommendations
**Cons:** Additional friction at log time; low signal until user has logged 10+ smokes
**Depends on:** Smoke Log feature shipping
