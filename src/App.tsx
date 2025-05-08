import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DashboardProvider } from "@/components/dashboard/DashboardLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MarketPage from "@/pages/MarketPage";
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
import VertexNewListingsPage from "./pages/BinanceNewListingsPage";
import HistoryPage from "./pages/HistoryPage";
import SpotMarketsPage from "@/pages/SpotMarketsPage";
import FuturesMarketsPage from "@/pages/FuturesMarketsPage";
import TopMoversPage from "@/pages/TopMoversPage";
import SpotTradingPage from "./pages/SpotTradingPage";
import MarginTradingPage from "./pages/MarginTradingPage";
import StrategyTradingPage from "./pages/StrategyTradingPage";
import P2PPage from "./pages/P2PPage";
import USDTFuturesPage from "./pages/USDTFuturesPage";
import CoinFuturesPage from "./pages/CoinFuturesPage";
import OptionsPage from "./pages/OptionsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import SimpleEarnPage from "./pages/SimpleEarnPage";
import AutoInvestPage from "./pages/AutoInvestPage";
import StakingPage from "./pages/StakingPage";
import VertexCardPage from "./pages/VertexCardPage";


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
              <Route path="/spot-markets" element={<ErrorBoundary><SpotMarketsPage /></ErrorBoundary>} />
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
              <Route path="/history" element={<ErrorBoundary><HistoryPage /></ErrorBoundary>} />
              <Route path="/new-listings" element={<ErrorBoundary><VertexNewListingsPage /></ErrorBoundary>} />
              <Route path="/futures-markets" element={<ErrorBoundary><FuturesMarketsPage /></ErrorBoundary>} />
              <Route path="/top-movers" element={<ErrorBoundary><TopMoversPage /></ErrorBoundary>} />
              <Route path="/spot-trading" element={<ErrorBoundary><SpotTradingPage /></ErrorBoundary>} />
              <Route path="/margin-trading" element={<ErrorBoundary><MarginTradingPage /></ErrorBoundary>} />
              <Route path="/strategy-trading" element={<ErrorBoundary><StrategyTradingPage /></ErrorBoundary>} />
              <Route path="/p2p" element={<ErrorBoundary><P2PPage /></ErrorBoundary>} />
              <Route path="/usdt-futures" element={<ErrorBoundary><USDTFuturesPage /></ErrorBoundary>} />
              <Route path="/coin-futures" element={<ErrorBoundary><CoinFuturesPage /></ErrorBoundary>} />
              <Route path="/options" element={<ErrorBoundary><OptionsPage /></ErrorBoundary>} />
              <Route path="/leaderboard" element={<ErrorBoundary><LeaderboardPage /></ErrorBoundary>} />
              <Route path="/simple-earn" element={<ErrorBoundary><SimpleEarnPage /></ErrorBoundary>} />
              <Route path="/auto-invest" element={<ErrorBoundary><AutoInvestPage /></ErrorBoundary>} />
              <Route path="/staking" element={<ErrorBoundary><StakingPage /></ErrorBoundary>} />
              <Route path="/vertex-card" element={<ErrorBoundary><VertexCardPage /></ErrorBoundary>} />
            </Routes>
          </DashboardProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;