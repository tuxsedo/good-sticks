import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MessageBubble from "@/components/MessageBubble";
import CigarSidebar from "@/components/CigarSidebar";
import { Cigarette, Send } from "lucide-react";
import type { ChatMessage, PalateProfile } from "@/lib/types";

const GREETING = `Hey — I'm GoodSticks, your cigar sommelier. I already know your palate, so we can skip the basics.\n\nWhat's on your mind? Looking for a recommendation, curious about a brand, or want to talk about something you smoked recently?`;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", role: "assistant", content: GREETING, suggestions: [
      "Recommend something new",
      "What pairs with bourbon?",
      "Tell me about Padrón",
    ]},
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleSend = (text?: string) => {
    const content = (text || input).trim();
    if (!content || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { response, suggestions } = getSimulatedResponse(content, palate);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        suggestions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
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
    <div className="h-screen bg-ember-gradient flex">
      <CigarSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-secondary/50 transition-colors"
          >
            <PanelLeftOpen className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
            <Cigarette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-display text-lg font-semibold text-foreground">GoodSticks</span>
            <p className="text-xs text-muted-foreground">Your cigar sommelier</p>
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
    </div>
  );
};

function getSimulatedResponse(userMessage: string, palate: PalateProfile | null): { response: string; suggestions: string[] } {
  const responses = [
    {
      response: `Based on what you're telling me, I'd go with a **Padrón 1964 Anniversary Maduro** in the Exclusivo vitola.\n\nThe rich chocolate and espresso notes pair beautifully, and the medium-full body matches your palate. At about 45 minutes, it won't rush you.\n\nWatch for the transition around the second third — it opens up with this incredible cedar sweetness.\n\nWant me to add it to your wishlist?`,
      suggestions: ["Add to my wishlist", "What else from Padrón?", "Something different"],
    },
    {
      response: `For this, you want the **Oliva Serie V Melanio Figurado**.\n\nIt's got depth — earth, dark chocolate, a touch of pepper — but the figurado shape means the flavor builds gradually. Perfect for when you're not in a hurry.\n\nPay attention to the retrohale in the first third. There's a cinnamon note that most people miss.\n\nHave you tried any Oliva before?`,
      suggestions: ["Tell me more about Oliva", "Add to humidor", "Suggest a pairing"],
    },
    {
      response: `I'd reach for the **My Father Le Bijou 1922 Torpedo** here.\n\nFull-bodied, yes, but it's not a brawler — there's a dark chocolate sweetness underneath all that strength that keeps it refined.\n\nOne thing to watch: the final third gets intense. If you're not ready for it, set it down with an inch and a half to go. No shame in that.\n\nWhat are you planning to drink with it?`,
      suggestions: ["Pairing ideas?", "Something milder", "Add to wishlist"],
    },
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

export default Chat;
