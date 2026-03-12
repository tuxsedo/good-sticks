import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ember-gradient flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-semibold text-foreground">Ember</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/50 px-4 py-1.5 text-sm text-primary mb-8">
            <Flame className="h-3.5 w-3.5" />
            Your personal cigar sommelier
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Know exactly{" "}
            <span className="text-gradient-ember italic">what to light</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed font-light">
            Tell Ember about your moment — the drink, the mood, the time you have — 
            and get one confident recommendation tailored to your palate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="ember"
              size="lg"
              className="text-base px-8 py-6"
              onClick={() => navigate("/onboarding")}
            >
              Build your palate profile
            </Button>
          </div>

          <p className="text-muted-foreground/60 text-sm mt-6">
            3 free conversations · No credit card required
          </p>
        </div>
      </main>

      {/* Footer accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
};

export default Landing;
