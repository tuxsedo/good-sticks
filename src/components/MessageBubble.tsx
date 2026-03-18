import { cn } from "@/lib/utils";
import { Cigarette } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: ChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
}

const MessageBubble = ({ message, onSuggestionClick }: MessageBubbleProps) => {
  const isUser = message.role === "user";

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

      {!isUser && message.suggestions && message.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 ml-11">
          {message.suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick?.(s)}
              className="text-xs rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-primary hover:bg-primary/15 transition-colors"
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
