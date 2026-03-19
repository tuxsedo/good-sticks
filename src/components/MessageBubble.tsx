import { useState } from "react";
import { cn } from "@/lib/utils";
import { Cigarette, BookmarkPlus, Check } from "lucide-react";
import type { ChatMessage, CigarRef } from "@/lib/types";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: ChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
  onSaveToWishlist?: (cigar: CigarRef) => void;
}

const MessageBubble = ({ message, onSuggestionClick, onSaveToWishlist }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!message.cigar || !onSaveToWishlist) return;
    onSaveToWishlist(message.cigar);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={cn("flex flex-col gap-2 animate-fade-in", isUser ? "items-end" : "items-start")}>
      <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
        {!isUser && (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center mt-1">
            <Cigarette className="h-4 w-4 text-primary" />
          </div>
        )}
        <div
          className={cn(
            "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-secondary text-foreground rounded-bl-sm"
          )}
        >
          {isUser ? (
            message.content
          ) : (
            <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-primary">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* Save to Wishlist chip — only shown when Ember included a cigar recommendation */}
      {!isUser && message.cigar && (
        <div className="ml-11">
          <button
            onClick={handleSave}
            disabled={saved}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs rounded-full border px-3 py-1.5 transition-all duration-200",
              saved
                ? "border-primary/40 bg-primary/10 text-primary cursor-default"
                : "border-border/50 bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            )}
          >
            {saved ? (
              <><Check className="h-3 w-3" /> Saved to Wishlist</>
            ) : (
              <><BookmarkPlus className="h-3 w-3" /> Save to Wishlist</>
            )}
          </button>
        </div>
      )}

      {/* Suggestion chips */}
      {!isUser && message.suggestions && message.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 ml-11">
          {message.suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick?.(s)}
              className="text-xs rounded-full border border-primary/30 bg-primary/5 px-4 py-2.5 text-primary hover:bg-primary/15 transition-colors min-h-[44px] flex items-center"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
