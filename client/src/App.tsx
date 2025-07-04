import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DashboardProvider } from "@/components/dashboard/DashboardLayout";
import { PreloadProvider } from "@/contexts/PreloadContext";
import { lazy, Suspense } from "react";

// Lazy load main pages to improve initial loading
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Lazy load other pages for better performance
const MarketPage = lazy(() => import("@/pages/MarketPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AssetsPage = lazy(() => import("./pages/AssetsPage"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const BotsPage = lazy(() => import("./pages/BotsPage"));
const DepositPage = lazy(() => import("./pages/DepositPage"));
const StrategiesPage = lazy(() => import("./pages/StrategiesPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const WithdrawPage = lazy(() => import("./pages/WithdrawPage"));
const ReferralsPage = lazy(() => import("./pages/ReferralsPage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));
const SocialTradingPage = lazy(() => import("./pages/SocialTradingPage"));
const DexScreenerPage = lazy(() => import("./pages/DexScreenerPage"));
const VertexNewListingsPage = lazy(() => import("./pages/BinanceNewListingsPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const SpotMarketsPage = lazy(() => import("@/pages/SpotMarketsPage"));
const FuturesMarketsPage = lazy(() => import("@/pages/FuturesMarketsPage"));
const TopMoversPage = lazy(() => import("@/pages/TopMoversPage"));
const SpotTradingPage = lazy(() => import("./pages/SpotTradingPage"));
const MarginTradingPage = lazy(() => import("./pages/MarginTradingPage"));
const StrategyTradingPage = lazy(() => import("./pages/StrategyTradingPage"));
const P2PPage = lazy(() => import("./pages/P2PPage"));
const USDTFuturesPage = lazy(() => import("./pages/USDTFuturesPage"));
const CoinFuturesPage = lazy(() => import("./pages/CoinFuturesPage"));
const OptionsPage = lazy(() => import("./pages/OptionsPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const SimpleEarnPage = lazy(() => import("./pages/SimpleEarnPage"));
const AutoInvestPage = lazy(() => import("./pages/AutoInvestPage"));
const StakingPage = lazy(() => import("./pages/StakingPage"));
const VertexCardPage = lazy(() => import("./pages/VertexCardPage"));
const LiquidityFarmingPage = lazy(() => import("./pages/LiquidityFarmingPage"));
const ApiManagementPage = lazy(() => import("./pages/ApiManagementPage"));
const RiskAnalysisPage = lazy(() => import("./pages/RiskAnalysisPage"));
const AITradingAssistantPage = lazy(() => import("./pages/AITradingAssistantPage"));
const CryptoConverterPage = lazy(() => import("./pages/CryptoConverterPage"));

// Loading component for lazy routes
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);
// import PWAInstallPrompt from '@/components/PWAInstallPrompt';

// Configure query client with proper error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        
        <BrowserRouter>
          <DashboardProvider>
            <PreloadProvider>
              <Suspense fallback={<LoadingComponent />}>
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
                <Route path="/liquidity-farming" element={<ErrorBoundary><LiquidityFarmingPage /></ErrorBoundary>} />
                <Route path="/api-management" element={<ErrorBoundary><ApiManagementPage /></ErrorBoundary>} />
                <Route path="/risk-analysis" element={<ErrorBoundary><RiskAnalysisPage /></ErrorBoundary>} />
                <Route path="/ai-assistant" element={<ErrorBoundary><AITradingAssistantPage /></ErrorBoundary>} />
                <Route path="/crypto-converter" element={<ErrorBoundary><CryptoConverterPage /></ErrorBoundary>} />
                </Routes>
              </Suspense>
            </PreloadProvider>
          </DashboardProvider>
        </BrowserRouter>
         <Toaster />
          <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;