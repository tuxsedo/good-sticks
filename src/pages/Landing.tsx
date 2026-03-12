import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cigarette } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ember-gradient flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Cigarette className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-semibold text-foreground">GoodSticks</span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/50 px-4 py-1.5 text-sm text-primary mb-8">
            <Cigarette className="h-3.5 w-3.5" />
            Your AI cigar sommelier
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Know exactly{" "}
            <span className="text-gradient-ember italic">what to light</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed font-light">
            Talk cigars with GoodSticks — get recommendations tailored to your palate, 
            build your humidor, and discover your next great smoke.
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
            Free to use · Up to 20 conversations
          </p>
        </div>
      </main>

      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
};

export default Landing;
