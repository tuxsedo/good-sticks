import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Star, Package, MessageSquare, Cigarette, SlidersHorizontal, UserCircle, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { sendMagicLink, signOut } from "@/lib/supabase";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const isActive = (path: string) => location.pathname === path;

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

  const handleSignOut = async () => {
    await signOut();
    setSheetOpen(false);
  };

  const openSheet = () => {
    setEmail("");
    setSent(false);
    setError("");
    setSheetOpen(true);
  };

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : null;

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

            {/* Profile / Auth button */}
          <button
            onClick={openSheet}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
              user
                ? "hover:bg-secondary/60"
                : "border border-primary/40 bg-primary/5 hover:bg-primary/10"
            )}
          >
            {user ? (
              <>
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
                  <p className="text-[10px] text-muted-foreground">Account</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <UserCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-foreground">Sign in</p>
                  <p className="text-[10px] text-muted-foreground">Save your data</p>
                </div>
              </>
            )}
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

        {/* Profile tab */}
        <button
          onClick={openSheet}
          className="flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors min-w-0"
        >
          {user ? (
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
              {userInitials}
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full border border-primary/50 bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-4 w-4 text-primary" />
            </div>
          )}
          <span className={cn("truncate", user ? "text-muted-foreground" : "text-primary font-medium")}>
            {user ? "Profile" : "Sign in"}
          </span>
        </button>
      </nav>

      {/* Auth / Profile sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          {user ? (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left">Your account</SheetTitle>
              </SheetHeader>
              <div className="flex items-center gap-3 mb-6 px-1">
                <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Humidor, wishlist &amp; palate synced</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-1"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <SheetHeader className="mb-2">
                <SheetTitle className="text-left">Save your data</SheetTitle>
              </SheetHeader>
              <p className="text-sm text-muted-foreground mb-5">
                Sign in to sync your humidor, wishlist, and palate across devices. We'll send a magic link — no password needed.
              </p>

              {sent ? (
                <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-4 text-sm text-foreground">
                  <p className="font-medium mb-1">Check your email</p>
                  <p className="text-muted-foreground">
                    We sent a sign-in link to <span className="text-foreground">{email}</span>. Tap the link to sign in.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendLink()}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    autoFocus
                  />
                  {error && (
                    <p className="text-xs text-destructive px-1">{error}</p>
                  )}
                  <button
                    onClick={handleSendLink}
                    disabled={!email.trim() || sending}
                    className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {sending ? "Sending…" : "Send magic link"}
                  </button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AppSidebar;
