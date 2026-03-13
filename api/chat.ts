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
  let prompt = `You are Ember, a confident and knowledgeable cigar guide for the GoodSticks app. You speak like an expert friend who loves cigars — direct, opinionated, and enthusiastic without being stuffy or academic.

When recommending cigars: give one confident pick, name the specific vitola, describe what to expect (flavors, body, burn time), and mention what makes it special or worth trying. Keep responses to 3–5 short paragraphs. Use **bold** for cigar names. Speak casually but with authority.`;

  if (palate) {
    prompt += `\n\nThis user's palate profile:
- Experience: ${EXPERIENCE_LABELS[palate.experience] || palate.experience}
- Preferred strength: ${STRENGTH_LABELS[palate.strength] || palate.strength}
- Flavors they love: ${palate.loveFlavors.length ? palate.loveFlavors.join(", ") : "not specified"}
- Flavors to avoid: ${palate.dislikeFlavors.length ? palate.dislikeFlavors.join(", ") : "none"}
- Usual drink pairing: ${DRINK_LABELS[palate.drinkPairing] || palate.drinkPairing}${palate.favoriteCigars.length ? `\n- Favorite cigars: ${palate.favoriteCigars.join(", ")}` : ""}

Tailor every recommendation to this profile. Never suggest cigars with a strength or flavor notes they want to avoid.`;
  }

  prompt += `\n\nAt the end of every response, on its own line, include exactly:
|||SUGGESTIONS:["suggestion 1","suggestion 2","suggestion 3"]|||

These should be 2–3 short, natural follow-up prompts the user might want to tap next (e.g., "Add to wishlist", "What pairs with this?", "Something milder"). Keep each under 6 words.`;

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
