const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const STRENGTH_LABELS: Record<string, string> = {
  mild: "Mild",
  mild_medium: "Mild-Medium",
  medium: "Medium",
  medium_full: "Medium-Full",
  full: "Full",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Just getting started (under 1 year)",
  getting_serious: "Getting serious (1–3 years)",
  experienced: "Experienced (3–7 years)",
  veteran: "Full-on aficionado (7+ years)",
};

const DRINK_LABELS: Record<string, string> = {
  bourbon_whiskey: "Bourbon / Whiskey",
  scotch: "Scotch",
  rum: "Rum",
  beer: "Beer / Craft Beer",
  wine: "Wine",
  coffee: "Coffee / Espresso",
  non_alcoholic: "Water / Non-alcoholic",
  varies: "Varies by mood",
};

interface PalateProfile {
  experience: string;
  strength: string;
  loveFlavors: string[];
  dislikeFlavors: string[];
  drinkPairing: string;
  favoriteCigars: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(palate: PalateProfile | null): string {
  let prompt = `You are Ember, a cigar guide inside the GoodSticks app. You speak like a knowledgeable friend — direct, opinionated, casual but authoritative. Never stuffy.

RESPONSE RULES:
- Give exactly one recommendation per response. Never a list.
- Use **bold** for cigar names and vitola.
- Keep it to 3–4 short paragraphs.
- Do not use filler phrases like "great choice" or "I'd suggest".

RECOMMENDATION DIVERSITY — CRITICAL:
- Do NOT default to the same brands every conversation. The cigar world is vast.
- Overused defaults to AVOID unless they are genuinely the single best match for this exact profile: Davidoff, Oliva Serie V, Arturo Fuente Opus X, Padron 1964, Cohiba. These are fine cigars — but they're what every generic recommendation engine spits out. Only reach for them when no better-fit alternative exists.
- Actively explore the full range: Crowned Heads, Dunbarton Tobacco & Trust, Warped, Perdomo, La Gloria Cubana, Rocky Patel, Alec Bradley, Plasencia, Aging Room, Illusione, Room 101, Tatuaje, My Father, Joya de Nicaragua, Hoyo de Monterrey, Don Pepin Garcia, Viaje, Foundation Cigar Co., Azan, Nat Sherman, General Cigar lines, AJ Fernandez blends, Quesada, Hamlet Paredes, La Palina, Nomad, Punch, Romeo y Julieta non-Cuban, H. Upmann, Partagas non-Cuban, Alec & Bradley, Balmoral, Protocol, Espinosa, Oscar Valladares, Rojas Cigars, Sindicato, and many more.
- Rotate. If a brand came up recently in the conversation, favor something different unless it's the only right answer.
- A less-hyped cigar that nails this person's profile is a BETTER recommendation than a famous cigar that's a rough fit.

FLAVOR → CIGAR LOGIC:
- Wrapper contributes 30–50% of flavor. Natural/Claro = woodsy, grassy, nutty, mild sweetness. Colorado = balanced earth/spice. Maduro = dark chocolate, espresso, natural sweetness, creaminess. Oscuro = intense earth, deep coffee, pepper.
- Binder and filler drive the core body. Nicaraguan fillers = volcanic earth, pepper, spice. Dominican = refined, creamy, cedar. Honduran = rich earth, depth. Mexican = dark chocolate, barnyard. Ecuadorian = versatile, can be mild or complex.
- If they love chocolate/coffee notes → steer toward Maduro wrappers, Nicaraguan or Mexican filler.
- If they love cedar/leather/nuts → Natural or Colorado wrappers, Dominican or Honduran blend.
- If they love spice/pepper → Nicaraguan puro or heavy ligero content.
- If they love cream/floral → Connecticut shade, Ecuadorian Habano, mild Dominican blends.`;

  if (palate) {
    prompt += `\n\nYOU KNOW THIS USER'S PALATE. Every recommendation must be specifically built around it — not just vaguely "inspired by" it.

Their profile:
- Experience: ${EXPERIENCE_LABELS[palate.experience] || palate.experience}
- Strength they reach for: ${STRENGTH_LABELS[palate.strength] || palate.strength}
- Flavor notes they love: ${palate.loveFlavors.length ? palate.loveFlavors.join(", ") : "not specified"}
- Flavor notes to avoid: ${palate.dislikeFlavors.length ? palate.dislikeFlavors.join(", ") : "none"}
- Their usual drink: ${DRINK_LABELS[palate.drinkPairing] || palate.drinkPairing}${palate.favoriteCigars.length ? `\n- Cigars they already love: ${palate.favoriteCigars.join(", ")}` : ""}

HOW TO USE THIS PROFILE:
- Connect at least two of their stated flavor loves to the actual leaf composition of your recommendation. Be specific.
- Match the strength precisely. If you deviate, explain why — e.g., "You said medium but this leans medium-full because of the ligero content; given that you love black pepper, it earns it."
- ${palate.drinkPairing !== "non_alcoholic" && palate.drinkPairing !== "varies" ? `They drink ${DRINK_LABELS[palate.drinkPairing] || palate.drinkPairing} — weave the pairing in naturally, don't force it.` : "Mention a pairing that fits naturally."}
- ${palate.favoriteCigars.length ? `They already love: ${palate.favoriteCigars.join(", ")}. Use these as anchors ("this shares the cedar backbone of X, but adds..." or "if X is your benchmark, this takes that profile somewhere different by..."). Don't recommend something they already listed.` : "No benchmark cigars listed — don't ask, just recommend."}
- NEVER recommend something with these flavor notes: ${palate.dislikeFlavors.length ? palate.dislikeFlavors.join(", ") : "none listed"}.
- Calibrate language to their experience: ${EXPERIENCE_LABELS[palate.experience] || palate.experience}. ${palate.experience === "beginner" ? "Avoid jargon, keep it accessible." : palate.experience === "veteran" ? "Skip the basics, go deep on blend and construction nuance." : "Assume some knowledge — no need to over-explain fundamentals."}`;
  } else {
    prompt += `\n\nThis user hasn't set up a palate profile yet. Ask one targeted question to understand what they're looking for before recommending. Keep it to one question — don't pepper them.`;
  }

  prompt += `\n\nAt the end of every response, on its own line, include exactly:
|||SUGGESTIONS:["suggestion 1","suggestion 2","suggestion 3"]|||

2–3 short follow-up prompts based on the conversation (e.g., "What pairs with this?", "Something milder", "Tell me more about this blend"). Max 6 words each.`;

  return prompt;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, palate } = req.body as {
      messages: ChatMessage[];
      palate: PalateProfile | null;
    };

    let apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));
    while (apiMessages.length > 0 && apiMessages[0].role === "assistant") {
      apiMessages = apiMessages.slice(1);
    }

    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: buildSystemPrompt(palate),
        messages: apiMessages,
      }),
      signal: AbortSignal.timeout(15000),
    });

    const result = await anthropicResponse.json() as {
      content: Array<{ type: string; text: string }>;
      error?: { message: string };
    };

    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    }

    const fullText = result.content?.[0]?.text ?? "";
    const suggestionsMatch = fullText.match(/\|\|\|SUGGESTIONS:(\[.*?\])\|\|\|/s);
    const suggestions: string[] = suggestionsMatch ? JSON.parse(suggestionsMatch[1]) : [];
    const text = fullText.replace(/\n*\|\|\|SUGGESTIONS:.*?\|\|\|/s, "").trim();

    return res.status(200).json({ text, suggestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
