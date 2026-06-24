import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/supabase";
import AuthForm from "@/components/AuthForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface AuthSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthSheet = ({ open, onOpenChange }: AuthSheetProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : null;

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        {user ? (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle className="text-left">Your account</SheetTitle>
            </SheetHeader>
            <div className="mb-6 flex items-center gap-3 px-1">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">Humidor, wishlist &amp; palate synced</p>
              </div>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-2 md:hidden">
              <button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/wishlist");
                }}
                className="min-h-[52px] rounded-lg border border-border/50 bg-secondary/20 px-3 py-3 text-left"
              >
                <p className="text-xs font-medium text-foreground">Wishlist</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Saved wants</p>
              </button>
              <button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/humidor");
                }}
                className="min-h-[52px] rounded-lg border border-border/50 bg-secondary/20 px-3 py-3 text-left"
              >
                <p className="text-xs font-medium text-foreground">Humidor</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Current stock</p>
              </button>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </>
        ) : (
          <>
            <SheetHeader className="mb-5">
              <SheetTitle className="text-left">Sign in</SheetTitle>
              <p className="text-left text-sm leading-relaxed text-muted-foreground">
                Use your existing account to skip the palate questionnaire and pick up where you left off.
              </p>
            </SheetHeader>
            <AuthForm showHeader={false} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AuthSheet;
