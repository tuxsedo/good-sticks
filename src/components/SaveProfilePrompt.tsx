import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

type State = "idle" | "loading" | "sent" | "error" | "unavailable";

export default function SaveProfilePrompt() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>(
    supabase ? "idle" : "unavailable"
  );
  const [errorMsg, setErrorMsg] = useState("");

  if (state === "unavailable") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email.trim()) return;
    setState("loading");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/chat`,
        data: {
          // Store palate in user metadata so it can be synced on first sign-in
          palate: localStorage.getItem("gs_palate") ?? "",
        },
      },
    });

    if (error) {
      setState("error");
      setErrorMsg(error.message);
    } else {
      setState("sent");
    }
  };

  if (state === "sent") {
    return (
      <div className="mt-8 flex flex-col items-center gap-2 animate-fade-in">
        <CheckCircle className="h-6 w-6 text-primary" />
        <p className="text-sm text-muted-foreground">
          Check your inbox — click the link to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-border/30 pt-8 w-full max-w-sm mx-auto animate-fade-in">
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Save your profile to access it from any device.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full rounded-lg border border-border bg-secondary/30 pl-8 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <Button
          type="submit"
          variant="ember"
          size="sm"
          disabled={state === "loading" || !email.trim()}
          className="shrink-0"
        >
          {state === "loading" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Save"
          )}
        </Button>
      </form>
      {state === "error" && (
        <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
      )}
      <p className="text-xs text-muted-foreground/50 mt-2 text-center">
        No password needed — we'll email you a sign-in link.
      </p>
    </div>
  );
}
