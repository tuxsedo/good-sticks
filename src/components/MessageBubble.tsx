import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center mt-1">
          <Flame className="h-4 w-4 text-primary" />
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
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;
