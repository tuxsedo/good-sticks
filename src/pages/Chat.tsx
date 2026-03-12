import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MessageBubble from "@/components/MessageBubble";
import { Flame, Send } from "lucide-react";
import type { ChatMessage, PalateProfile } from "@/lib/types";

const GREETING = `Hey — I'm Ember. I know your palate now, so let's make this easy.\n\nTell me about right now. What are you drinking? Where are you? How much time do you have? I'll tell you exactly what to light.`;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load palate profile
  const palate: PalateProfile | null = (() => {
    try {
      const stored = localStorage.getItem("ember_palate");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response (replace with real API later)
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedResponse(text, palate),
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen bg-ember-gradient flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
        <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
          <Flame className="h-5 w-5 text-primary" />
        </div>
        <div>
          <span className="font-display text-lg font-semibold text-foreground">Ember</span>
          <p className="text-xs text-muted-foreground">Your cigar sommelier</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
              <Flame className="h-4 w-4 text-primary animate-ember-pulse" />
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
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your moment..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <Button
            variant="ember"
            size="icon"
            className="h-11 w-11 rounded-xl flex-shrink-0"
            disabled={!input.trim() || isTyping}
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

function getSimulatedResponse(userMessage: string, palate: PalateProfile | null): string {
  // Simulated responses — will be replaced with Claude API
  const responses = [
    `Based on what you're telling me, I'd go with a **Padrón 1964 Anniversary Maduro** in the Exclusivo vitola. Here's why:\n\nThe rich chocolate and espresso notes will pair beautifully with your bourbon, and the medium-full body matches your palate perfectly. At about 45 minutes, it won't rush you.\n\nWatch for the transition around the second third — it opens up with this incredible cedar sweetness that makes you slow down. That's when it really shines.\n\nLet me know how it goes.`,
    `For this moment, you want the **Oliva Serie V Melanio Figurado**.\n\nIt's got that depth you like — earth, dark chocolate, a touch of pepper — but the figurado shape means the flavor builds gradually. Perfect for when you're settled in and not in a hurry.\n\nPay attention to the retrohale in the first third. There's a cinnamon note that most people miss. It's subtle but it's there.\n\nReport back — I want to know if it hit right.`,
    `I'm reaching for the **My Father Le Bijou 1922 Torpedo** for you tonight.\n\nFull-bodied, yes, but it's not a brawler — there's a dark chocolate sweetness underneath all that strength that keeps it refined. With what you're drinking, the flavors will lock in perfectly.\n\nOne thing to watch: the final third gets intense. If you're not ready for it, set it down with an inch and a half to go. No shame in that — it's the smart move.\n\nEnjoy it.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

export default Chat;
