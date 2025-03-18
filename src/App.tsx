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
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./context/authContext"; // Added import for AuthProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DashboardProvider>
          <AuthProvider> {/* Added AuthProvider wrapper */}
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/demo" element={<DemoPage />} />
              </Routes>
            </ThemeProvider>
          </AuthProvider> {/* Closed AuthProvider wrapper */}
        </DashboardProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;