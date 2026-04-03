import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MessageBubble from "@/components/MessageBubble";
import { Cigarette, Send } from "lucide-react";
import type { ChatMessage, PalateProfile, CigarRef, HumidorCigar, SmokeLogEntry } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { getPalate, getHumidor, getSmokeLog, addWishlistCigar } from "@/lib/supabase";

const GREETING = `Hey, I'm Ember, your cigar sidekick. I already know your palate, so we can skip the basics.\n\nWhat's on your mind? Looking for a recommendation, curious about a brand, or want to talk about something you smoked recently?`;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem("gs_chat_messages");
      if (stored) {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: "1",
        role: "assistant",
        content: GREETING,
        suggestions: [
          "Recommend something new",
          "Best smoke for right now",
          "How do I find my go-to cigar?",
        ],
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);   // shows the dots indicator
  const [isSending, setIsSending] = useState(false); // disables the input
  const scrollRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const [palate, setPalate] = useState<PalateProfile | null>(() => {
    try {
      const stored = localStorage.getItem("gs_palate");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [humidor, setHumidor] = useState<HumidorCigar[]>(() => {
    try {
      const stored = localStorage.getItem("gs_humidor");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [smokeLog, setSmokeLog] = useState<SmokeLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem("gs_smoke_log");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // When signed in, load palate + humidor + smoke log from Supabase (fresh on every mount)
  useEffect(() => {
    if (!user) return;
    getPalate().then((p) => { if (p) setPalate(p); });
    getHumidor().then((h) => {
      setHumidor(h);
      // Merge humidor reviews into smoke log so Ember sees all rated smokes
      const humidorEntries: SmokeLogEntry[] = h.flatMap((cigar) =>
        (cigar.reviews ?? []).map((review) => ({
          id: `humidor-${review.id}`,
          brand: cigar.brand,
          name: cigar.name,
          rating: review.rating,
          note: review.notes,
          smokedAt: review.reviewedAt,
        }))
      );
      getSmokeLog().then((log) => {
        const merged = [...log, ...humidorEntries].sort(
          (a, b) => new Date(b.smokedAt).getTime() - new Date(a.smokedAt).getTime()
        );
        setSmokeLog(merged);
      });
    });
  }, [user]);

  // Persist chat messages to sessionStorage so they survive tab navigation
  useEffect(() => {
    try {
      sessionStorage.setItem("gs_chat_messages", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSaveToWishlist = async (cigar: CigarRef) => {
    if (user) {
      await addWishlistCigar({ brand: cigar.brand, name: cigar.name });
    } else {
      try {
        const stored = localStorage.getItem("gs_wishlist");
        const wishlist = stored ? (JSON.parse(stored) as Array<{ id: string; brand: string; name: string; addedAt: string }>) : [];
        const alreadySaved = wishlist.some((c) => c.name.toLowerCase() === cigar.name.toLowerCase());
        if (!alreadySaved) {
          wishlist.unshift({ id: Date.now().toString(), brand: cigar.brand, name: cigar.name, addedAt: new Date().toISOString() });
          localStorage.setItem("gs_wishlist", JSON.stringify(wishlist));
        }
      } catch {}
    }
  };

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isSending) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setIsSending(true);

    const assistantId = (Date.now() + 1).toString();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], palate, humidor, smokeLog }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Request failed" })) as { error?: string };
        throw new Error(err.error ?? "Request failed");
      }

      if (!response.body) throw new Error("No stream body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = "";
      let partialContent = "";
      let messageAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split("\n");
        lineBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();

          try {
            const event = JSON.parse(data) as {
              type: string;
              text?: string;
              suggestions?: string[];
              cigar?: CigarRef | null;
              message?: string;
            };

            if (event.type === "delta" && event.text) {
              partialContent += event.text;

              // First token: hide typing dots, show partial message
              if (!messageAdded) {
                setIsTyping(false);
                setMessages((prev) => [
                  ...prev,
                  { id: assistantId, role: "assistant", content: partialContent },
                ]);
                messageAdded = true;
              } else {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: partialContent } : m
                  )
                );
              }
            } else if (event.type === "done") {
              // Finalize: set suggestions + cigar from structured data
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: partialContent,
                        suggestions: event.suggestions ?? [],
                        cigar: event.cigar ?? null,
                      }
                    : m
                )
              );
            } else if (event.type === "error") {
              throw new Error(event.message ?? "Stream error");
            }
          } catch (parseErr) {
            // Skip malformed SSE lines (JSON.parse throws for non-JSON data lines)
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setIsTyping(false);
      setMessages((prev) => {
        const hasAssistant = prev.some((m) => m.id === assistantId);
        if (hasAssistant) {
          return prev.map((m) =>
            m.id === assistantId ? { ...m, content: `Something went wrong: ${message}` } : m
          );
        }
        return [...prev, { id: assistantId, role: "assistant", content: `Something went wrong: ${message}` }];
      });
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
        <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Cigarette className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <span className="font-display text-lg font-semibold text-foreground">Ember</span>
          <p className="text-xs text-muted-foreground truncate">Your best smoke sidekick</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSuggestionClick={(s) => handleSend(s)}
            onSaveToWishlist={handleSaveToWishlist}
          />
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
              <Cigarette className="h-4 w-4 text-primary animate-ember-pulse" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 px-4 py-3">
        <div className="flex items-end gap-2 max-w-2xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about cigars..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <Button
            variant="ember"
            size="icon"
            className="h-11 w-11 rounded-xl flex-shrink-0"
            disabled={!input.trim() || isSending}
            onClick={() => handleSend()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
