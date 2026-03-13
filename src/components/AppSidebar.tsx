import { useLocation, useNavigate } from "react-router-dom";
import { Home, Star, Package, Flame, Cigarette } from "lucide-react";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cigarsOpen, setCigarsOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-56 border-r border-border/50 bg-card flex flex-col shrink-0 h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Cigarette className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-lg font-semibold text-foreground">GoodSticks</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {/* Home */}
        <button
          onClick={() => navigate("/home")}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive("/home")
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          )}
        >
          <Home className="h-4 w-4" />
          Home
        </button>

        {/* Ember Chat — primary action */}
        <button
          onClick={() => navigate("/chat")}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
            isActive("/chat")
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <Flame className="h-[18px] w-[18px]" />
          </div>
          Ember Chat
        </button>

        {/* My Cigars group */}
        <div className="pt-2">
          <button
            onClick={() => setCigarsOpen(!cigarsOpen)}
            className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            My Cigars
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", cigarsOpen && "rotate-180")} />
          </button>

          {cigarsOpen && (
            <div className="mt-1 space-y-0.5 pl-1">
              <button
                onClick={() => navigate("/wishlist")}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive("/wishlist")
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Star className="h-4 w-4" />
                Wishlist
              </button>
              <button
                onClick={() => navigate("/humidor")}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive("/humidor")
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Package className="h-4 w-4" />
                My Humidor
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground/50">Your best smoke sidekick</p>
      </div>
    </div>
  );
};

export default AppSidebar;
