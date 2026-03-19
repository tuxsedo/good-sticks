import { useLocation, useNavigate } from "react-router-dom";
import { Home, Star, Package, MessageSquare, Cigarette, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const navItem = (path: string, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px]",
        isActive(path)
          ? "bg-primary/15 text-primary font-medium"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );

  const bottomNavItem = (path: string, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors min-w-0",
        isActive(path) ? "text-primary" : "text-muted-foreground"
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 border-r border-border/50 bg-card flex-col shrink-0 h-full">
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
          {navItem("/home", <Home className="h-4 w-4" />, "Home")}

          {/* Ember Chat */}
          <button
            onClick={() => navigate("/chat")}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px]",
              isActive("/chat")
                ? "bg-primary/15 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <div className="h-5 w-5 rounded-md bg-primary/15 flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
            </div>
            Ember Chat
          </button>

          {navItem("/wishlist", <Star className="h-4 w-4" />, "Wishlist")}
          {navItem("/humidor", <Package className="h-4 w-4" />, "My Humidor")}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/50 space-y-1">
          <button
            onClick={() => navigate("/onboarding?edit=true")}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground/70 hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Edit palate
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 flex items-center justify-around safe-area-bottom">
        {bottomNavItem("/home", <Home className="h-5 w-5" />, "Home")}
        {bottomNavItem(
          "/chat",
          <div className={cn(
            "h-6 w-6 rounded-md flex items-center justify-center",
            isActive("/chat") ? "bg-primary/20" : "bg-muted/40"
          )}>
            <MessageSquare className="h-4 w-4" />
          </div>,
          "Ember"
        )}
        {bottomNavItem("/wishlist", <Star className="h-5 w-5" />, "Wishlist")}
        {bottomNavItem("/humidor", <Package className="h-5 w-5" />, "Humidor")}
      </nav>
    </>
  );
};

export default AppSidebar;
