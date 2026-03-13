import Anthropic from "@anthropic-ai/sdk";

export const config = { runtime: "edge" };

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
- Do not use filler phrases like "great choice" or "I'd suggest".`;

  if (palate) {
    prompt += `\n\nYOU KNOW THIS USER'S PALATE. Use it. Every recommendation must directly connect to their specific profile — do not give generic answers.

Their profile:
- Experience: ${EXPERIENCE_LABELS[palate.experience] || palate.experience}
- Strength they reach for: ${STRENGTH_LABELS[palate.strength] || palate.strength}
- Flavor notes they love: ${palate.loveFlavors.length ? palate.loveFlavors.join(", ") : "not specified"}
- Flavor notes to avoid: ${palate.dislikeFlavors.length ? palate.dislikeFlavors.join(", ") : "none"}
- Their usual drink: ${DRINK_LABELS[palate.drinkPairing] || palate.drinkPairing}${palate.favoriteCigars.length ? `\n- Cigars they already love: ${palate.favoriteCigars.join(", ")}` : ""}

HOW TO USE THE PROFILE:
- Name specific flavor notes from their "loves" list and explain how the recommendation delivers them.
- Match the strength to their stated preference. If recommending something slightly stronger or milder, say why.
- If they drink ${DRINK_LABELS[palate.drinkPairing] || palate.drinkPairing}, mention the pairing naturally.
- If they listed favorite cigars, use those as a reference point ("if you love X, this will feel familiar because...").
- NEVER recommend something with flavor notes they want to avoid.
- Calibrate complexity of explanation to their experience level — don't over-explain to a veteran, don't overwhelm a beginner.`;
  } else {
    prompt += `\n\nThis user hasn't set up a palate profile yet. Ask one targeted question to understand what they're looking for before recommending.`;
  }

  prompt += `\n\nAt the end of every response, on its own line, include exactly:
|||SUGGESTIONS:["suggestion 1","suggestion 2","suggestion 3"]|||

2–3 short follow-up prompts based on the conversation (e.g., "What pairs with this?", "Something milder", "Tell me more about this blend"). Max 6 words each.`;

  return prompt;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { messages, palate } = (await req.json()) as {
    messages: ChatMessage[];
    palate: PalateProfile | null;
  };

  // Strip leading assistant messages — Anthropic requires the conversation to start with a user turn.
  let apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));
  while (apiMessages.length > 0 && apiMessages[0].role === "assistant") {
    apiMessages = apiMessages.slice(1);
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: buildSystemPrompt(palate),
          messages: apiMessages,
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      ...CORS_HEADERS,
    },
  });
}
