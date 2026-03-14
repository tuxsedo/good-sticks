import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MessageBubble from "@/components/MessageBubble";
import { Cigarette, Send } from "lucide-react";
import type { ChatMessage, PalateProfile } from "@/lib/types";

const GREETING = `Hey, I'm Ember, your cigar sidekick. I already know your palate, so we can skip the basics.\n\nWhat's on your mind? Looking for a recommendation, curious about a brand, or want to talk about something you smoked recently?`;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", role: "assistant", content: GREETING, suggestions: [
      "Recommend something new",
      "Best smoke for right now",
      "How do I find my go-to cigar?",
    ]},
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const palate: PalateProfile | null = (() => {
    try {
      const stored = localStorage.getItem("gs_palate");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const assistantId = (Date.now() + 1).toString();
    let firstChunk = true;
    let fullText = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], palate }),
      });

      if (!response.ok || !response.body) throw new Error("API error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              fullText += parsed.text;
              if (firstChunk) {
                firstChunk = false;
                setIsTyping(false);
                setMessages((prev) => [
                  ...prev,
                  { id: assistantId, role: "assistant", content: fullText },
                ]);
              } else {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullText } : m
                  )
                );
              }
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      // Parse |||SUGGESTIONS:[...]||| out of the completed response
      const suggestionsMatch = fullText.match(/\|\|\|SUGGESTIONS:(\[.*?\])\|\|\|/s);
      const suggestions: string[] = suggestionsMatch
        ? JSON.parse(suggestionsMatch[1])
        : [];
      const cleanContent = fullText
        .replace(/\n*\|\|\|SUGGESTIONS:.*?\|\|\|/s, "")
        .trim();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: cleanContent, suggestions } : m
        )
      );
    } catch (err) {
      setIsTyping(false);
      const message = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: `Error: ${message}`,
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
        <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
          <Cigarette className="h-5 w-5 text-primary" />
        </div>
        <div>
          <span className="font-display text-lg font-semibold text-foreground">Ember</span>
          <p className="text-xs text-muted-foreground">Your best smoke sidekick</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSuggestionClick={(s) => handleSend(s)}
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
            disabled={!input.trim() || isTyping}
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
