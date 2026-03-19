export const config = { runtime: "edge" };

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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
- If they love cream/floral → Connecticut shade, Ecuadorian Habano, mild Dominican blends.

COMMUNITY-VETTED REFERENCE LIBRARY (r/cigars wiki picks):
These are battle-tested, well-loved cigars. Use them as your primary recommendation pool — cross-referenced against the user's strength, experience, and flavor profile. You can recommend outside this list, but when something here fits, prefer it over an untested pick.

MILD: Arturo Fuente 8-5-8 Natural, AVO Classic, Oliva Connecticut, NUB Connecticut, My Father Connecticut, CAO Gold, Rocky Patel Connecticut, Ashton Classic Connecticut, Macanudo Cafe, Romeo y Julieta Reserve.

MEDIUM: Arturo Fuente Hemingway Short Story, Flor de las Antillas by My Father, Drew Estate Undercrown, Padrón 2000/3000 series, Crowned Heads Four Kicks, Perdomo Champagne, Illusione Rothschild, Tatuaje Tattoo, Perla Del Mar, Romeo y Julieta 1875.

FULL: La Flor Dominicana Double Ligero, Oliva Serie V, Tatuaje Black Label, Drew Estate Liga Privada No. 9, Drew Estate Herrera Esteli, Padrón 1964 Maduro, Crowned Heads Jericho Hill, Joya de Nicaragua Antaño Dark Corojo, CAO Brazilia, My Father Le Bijou 1922.

BEGINNER-FRIENDLY: Drew Estate Undercrown Shade, Drew Estate Undercrown, My Father Flor De Las Antillas, Padrón 3000 Natural, Perdomo 10th Anniversary Champagne, Crowned Heads Mil Dias, Oliva Connecticut Reserve, Foundation Charter Oak, Illusione Epernay.

BUDGET (~$5 or less): 5 Vegas Classic, Arturo Fuente 8-5-8, BrickHouse, CAO Brazilia, Don Pepin Garcia Black/Blue, Genesis the Project by Ramon Bueso, Joya de Nicaragua Antaño 1970, La Gloria Cubana Serie R, MUWAT Baitfish, NUB Cameroon, NUB Habano, Oliva Serie G, Oliva Serie G Maduro, Padrón 2000/3000, Perdomo 10th Anniversary, Punch Gran Puro, Punch Rare Corojo.

SHORT SMOKES (under 45 min): Arturo Fuente Hemingway Short Story, Camacho Criollo Machitos, Drew Estate Liga Privada Papas Fritas, Drew Estate MUWAT Bait Fish, Tatuaje Reserva Petit Cazadores, Quesada 40th Anniversary Petit Belicoso.

SPECIAL OCCASION: Arturo Fuente Opus X (note: benefits from aging), Drew Estate Liga Privada Único Feral Flying Pig, God of Fire Serie B, Padrón 1964 Anniversary Maduro, Arturo Fuente Añejo Shark No. 77, Padrón 1926 Serie Maduro, La Palina Goldie, Davidoff Anniversario.

HOW TO USE THIS LIST:
- Match strength tier to the user's profile first.
- For beginners, lean on the beginner list — don't throw a full-strength Nicaraguan puro at someone new.
- If budget or time is mentioned, draw from those tiers and call it out ("under $5, under 45 minutes").
- Special occasion context (birthday, milestone, celebration) → use that tier and acknowledge the moment.
- These picks are the community floor. Go deeper when you can — a lesser-known cigar that perfectly matches this person's profile beats a famous one that's a rough fit.`;

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

  prompt += `\n\nAt the end of every response, on its own line, include:
1. |||SUGGESTIONS:["suggestion 1","suggestion 2","suggestion 3"]|||
   2–3 short follow-up prompts based on the conversation. Max 6 words each.
2. If (and ONLY if) your response includes a specific cigar recommendation, also include on its own line:
   |||CIGAR:{"name":"Full Cigar Line Name","brand":"Brand Name"}|||
   Use the full line name as it appears on the box (e.g. "Liga Privada No. 9", not "Liga Privada").`;

  return prompt;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { messages, palate } = (await req.json()) as {
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
        "x-api-key": (globalThis as Record<string, unknown>).ANTHROPIC_API_KEY as string ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: buildSystemPrompt(palate),
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!anthropicResponse.ok || !anthropicResponse.body) {
      const errText = await anthropicResponse.text().catch(() => "Unknown error");
      return new Response(JSON.stringify({ error: errText }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Stream Anthropic SSE → our SSE, buffering sentinel text
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    (async () => {
      const reader = anthropicResponse.body!.getReader();
      let lineBuffer = "";
      let fullText = "";
      let forwardedLength = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data) as {
                type: string;
                delta?: { type: string; text: string };
              };
              if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                fullText += event.delta.text;

                // Only forward text up to the first ||| sentinel marker
                const sentinelIdx = fullText.indexOf("|||");
                const safeEnd = sentinelIdx === -1 ? fullText.length : sentinelIdx;

                if (safeEnd > forwardedLength) {
                  const chunk = fullText.slice(forwardedLength, safeEnd);
                  forwardedLength = safeEnd;
                  await writer.write(
                    encoder.encode(`data: ${JSON.stringify({ type: "delta", text: chunk })}\n\n`)
                  );
                }
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        // Parse sentinels from complete text
        const suggestionsMatch = fullText.match(/\|\|\|SUGGESTIONS:(\[.*?\])\|\|\|/s);
        const suggestions: string[] = suggestionsMatch
          ? (JSON.parse(suggestionsMatch[1]) as string[])
          : [];

        const cigarMatch = fullText.match(/\|\|\|CIGAR:(\{.*?\})\|\|\|/s);
        const cigar = cigarMatch
          ? (JSON.parse(cigarMatch[1]) as { name: string; brand: string })
          : null;

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: "done", suggestions, cigar })}\n\n`)
        );
      } catch (err) {
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: String(err) })}\n\n`
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}
