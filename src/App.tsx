import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useVpnCheck } from "@/hooks/useVpnCheck";
import { VpnBlocked } from "@/components/VpnBlocked";
import { CookieConsent } from "@/components/CookieConsent";
import StatusPage from "./pages/StatusPage";
import AuthPage from "./pages/AuthPage";
import CookiePreferences from "./pages/CookiePreferences";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppContent() {
  const { allowed, loading, message } = useVpnCheck();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allowed) {
    return <VpnBlocked message={message} />;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StatusPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/cookies" element={<CookiePreferences />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <CookieConsent />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
