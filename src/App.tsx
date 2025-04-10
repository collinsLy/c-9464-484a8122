import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardProvider } from "@/components/dashboard/DashboardLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { PriceService } from "./lib/price-service"; // Added import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DashboardProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/bots" element={<BotsPage />} />
            <Route path="/deposit" element={<DepositPage />} />
            <Route path="/strategies" element={<StrategiesPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
          </Routes>
        </DashboardProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Start price updates
PriceService.startPriceUpdates(); //Added this line

export default App;