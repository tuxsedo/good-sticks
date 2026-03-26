import { useState } from "react";
import { MessageCircle, X, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Set up a free form at formspree.io and paste your form ID here
const FORMSPREE_URL = "https://formspree.io/f/YOUR_FORM_ID";

type Status = "idle" | "open" | "sending" | "sent" | "error";

const FeedbackButton = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const open = () => setStatus("open");
  const close = () => {
    setStatus("idle");
    setMessage("");
  };

  const submit = async () => {
    if (!message.trim()) return;
    setStatus("sending");

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ message, page: window.location.pathname }),
      });

      if (res.ok) {
        setStatus("sent");
        setMessage("");
        setTimeout(close, 2500);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      {/* Backdrop */}
      {status === "open" || status === "sending" || status === "sent" || status === "error" ? (
        <div
          className="fixed inset-0 z-40"
          onClick={close}
          aria-hidden="true"
        />
      ) : null}

      {/* Feedback panel */}
      {(status === "open" || status === "sending" || status === "sent" || status === "error") && (
        <div className="hidden md:block fixed bottom-20 right-4 md:bottom-6 z-50 w-72 rounded-xl border border-border/60 bg-card shadow-lg animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <span className="text-sm font-medium text-foreground">Send feedback</span>
            <button onClick={close} className="text-muted-foreground/50 hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            {status === "sent" ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium">Thanks for the feedback!</p>
                <p className="text-xs text-muted-foreground">It goes straight to the founder.</p>
              </div>
            ) : (
              <>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind? Bug, idea, or anything else..."
                  rows={3}
                  disabled={status === "sending"}
                  className="w-full resize-none rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-60"
                />
                {status === "error" && (
                  <p className="text-xs text-destructive mt-1.5">
                    Something went wrong — try again or email us directly.
                  </p>
                )}
                <button
                  onClick={submit}
                  disabled={!message.trim() || status === "sending"}
                  className={cn(
                    "mt-3 w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {status === "sending" ? (
                    "Sending..."
                  ) : (
                    <><Send className="h-3.5 w-3.5" /> Send</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={status === "idle" ? open : close}
        title="Send feedback"
        className={cn(
          "hidden md:flex fixed bottom-20 right-4 md:bottom-6 z-50",
          "h-11 w-11 rounded-full border border-border/60 bg-card shadow-md",
          "flex items-center justify-center",
          "text-muted-foreground hover:text-primary hover:border-primary/40 transition-all",
          // Hide when panel is open
          (status === "open" || status === "sending" || status === "sent" || status === "error") && "opacity-0 pointer-events-none"
        )}
      >
        <MessageCircle className="h-4 w-4" />
      </button>
    </>
  );
};

export default FeedbackButton;
