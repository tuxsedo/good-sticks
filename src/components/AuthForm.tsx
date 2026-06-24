import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendMagicLink } from "@/lib/supabase";

interface AuthFormProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
}

const AuthForm = ({
  title = "Sign in to GoodSticks",
  description = "Enter your email and we'll send a magic link. No password needed.",
  showHeader = true,
}: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSendLink = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError("");
    const { error: err } = await sendMagicLink(email.trim());
    setSending(false);
    if (err) {
      setError(err.message || "Something went wrong. Try again.");
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="space-y-5">
        {showHeader && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We sent a sign-in link to <span className="text-foreground">{email}</span>. Tap the link to open your account.
            </p>
          </div>
        )}
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-4 text-sm text-foreground">
          <p className="font-medium">Check your email</p>
          <p className="mt-1 text-muted-foreground">
            We sent a sign-in link to <span className="text-foreground">{email}</span>. The link will sign you in and take you straight to GoodSticks.
          </p>
        </div>
        <Button
          type="button"
          variant="ember-ghost"
          className="w-full min-h-[44px]"
          onClick={() => {
            setSent(false);
            setError("");
          }}
        >
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSendLink();
      }}
    >
      {showHeader && (
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-lg border border-border bg-secondary/50 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            autoComplete="email"
          />
        </div>
        {error && <p className="px-1 text-xs text-destructive">{error}</p>}
        <Button
          type="submit"
          variant="ember"
          disabled={!email.trim() || sending}
          className="w-full min-h-[44px]"
        >
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          {sending ? "Sending..." : "Send magic link"}
        </Button>
      </div>
    </form>
  );
};

export default AuthForm;
