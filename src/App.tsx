import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardProvider } from "@/components/dashboard/DashboardLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MarketPage from "./pages/MarketPage";
import SettingsPage from "./pages/SettingsPage";
import AssetsPage from "./pages/AssetsPage";
import DemoPage from "./pages/DemoPage";
import BotsPage from "./pages/BotsPage";
import DepositPage from "./pages/DepositPage";
import StrategiesPage from "./pages/StrategiesPage";
import SupportPage from "./pages/SupportPage";
import WithdrawPage from "./pages/WithdrawPage";
import ReferralsPage from "./pages/ReferralsPage";
import AlertsPage from "./pages/AlertsPage";
import SocialTradingPage from "./pages/SocialTradingPage";
import DexScreenerPage from "./pages/DexScreenerPage";
import VertexNewListingsPage from "@/pages/VertexNewListingsPage"; // Added import

// Configure query client to not show error toasts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      useErrorBoundary: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      useErrorBoundary: true,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DashboardProvider>
            <Routes>
              <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
              <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="/market" element={<ErrorBoundary><MarketPage /></ErrorBoundary>} />
              <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
              <Route path="/assets" element={<ErrorBoundary><AssetsPage /></ErrorBoundary>} />
              <Route path="/demo" element={<ErrorBoundary><DemoPage /></ErrorBoundary>} />
              <Route path="/bots" element={<ErrorBoundary><BotsPage /></ErrorBoundary>} />
              <Route path="/deposit" element={<ErrorBoundary><DepositPage /></ErrorBoundary>} />
              <Route path="/strategies" element={<ErrorBoundary><StrategiesPage /></ErrorBoundary>} />
              <Route path="/support" element={<ErrorBoundary><SupportPage /></ErrorBoundary>} />
              <Route path="/withdraw" element={<ErrorBoundary><WithdrawPage /></ErrorBoundary>} />
              <Route path="/referrals" element={<ErrorBoundary><ReferralsPage /></ErrorBoundary>} />
              <Route path="/alerts" element={<ErrorBoundary><AlertsPage /></ErrorBoundary>} />
              <Route path="/social-trading" element={<ErrorBoundary><SocialTradingPage /></ErrorBoundary>} />
              <Route path="/new-listings" element={<ErrorBoundary><VertexNewListingsPage /></ErrorBoundary>} /> {/* Added route */}
            </Routes>
          </DashboardProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;