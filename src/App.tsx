import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Wishlist from "./pages/Wishlist";
import Humidor from "./pages/Humidor";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { supabase, syncPalateToSupabase } from "@/lib/supabase";

const queryClient = new QueryClient();

/** Listens for Supabase auth events and syncs the local palate profile. */
function AuthSync() {
  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
          const raw = localStorage.getItem("gs_palate");
          if (raw) {
            try {
              await syncPalateToSupabase(
                session.user.id,
                session.user.email ?? "",
                JSON.parse(raw)
              );
            } catch { /* non-critical */ }
          }
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthSync />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/humidor" element={<Humidor />} />
            <Route path="/chat" element={<Chat />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
