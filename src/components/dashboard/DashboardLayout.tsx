import React, { createContext, useContext, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import {
  Home, LineChart, BarChart3, Wallet, CreditCard,
  TrendingUp, History, Settings, PlayCircle, HelpCircle, ArrowDownCircle, ArrowUpCircle,
  Users, Bell
} from "lucide-react";

interface DashboardContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  return (
    <DashboardContext.Provider value={{ isDemoMode, toggleDemoMode }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return context;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // State for demo mode (This is redundant now, as it's managed by the provider)
  //const [isDemoMode, setIsDemoMode] = useState(false);

  // Function to toggle demo mode (Also redundant now)
  //const toggleDemoMode = () => {
  //  setIsDemoMode(prev => !prev);
  //};

  // Navigation items for the sidebar with proper paths
  const navItems = [
    { icon: Home, label: "Dashboard", id: "dashboard", path: "/dashboard" },
    { icon: LineChart, label: "Markets", id: "markets", path: "/market" },
    { icon: TrendingUp, label: "Trading", id: "trading", path: "/dashboard?tab=trading" },
    { icon: Wallet, label: "Assets", id: "assets", path: "/assets" },
    { icon: ArrowUpCircle, label: "Deposit", id: "deposit", path: "/deposit" },
    { icon: ArrowDownCircle, label: "Withdraw", id: "withdraw", path: "/withdraw" },
    { icon: BarChart3, label: "Bots & Strategies", id: "bots", path: "/bots" },
    { icon: Bell, label: "Alerts", id: "alerts", path: "/alerts" },
    { icon: Users, label: "Social Trading", id: "social-trading", path: "/social-trading" },
    { icon: Users, label: "Referrals", id: "referrals", path: "/referrals" },
    { icon: PlayCircle, label: "Demo", id: "demo", path: "/demo" },
    { icon: History, label: "History", id: "history", path: "/dashboard?tab=history" },
    { icon: HelpCircle, label: "Support", id: "support", path: "/support" },
    { icon: Settings, label: "Settings", id: "settings", path: "/settings" },
  ];

  return (
    <DashboardProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <DashboardSidebar navItems={navItems} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader />

          {/* Dashboard Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
};