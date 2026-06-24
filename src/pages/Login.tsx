import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cigarette } from "lucide-react";
import AuthForm from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/chat", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen landing-bg flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <Cigarette className="h-5 w-5 text-primary" />
          <span className="font-display text-lg font-semibold text-foreground">GoodSticks</span>
        </div>
      </nav>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-lg border border-border/60 bg-card/80 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <AuthForm description="Sign in with the email on your account. We will send a magic link so you can skip the questionnaire." />
          <div className="mt-6 border-t border-border/50 pt-5">
            <Button
              type="button"
              variant="ember-outline"
              className="w-full min-h-[44px]"
              onClick={() => navigate("/onboarding")}
            >
              Create a new palate profile
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
