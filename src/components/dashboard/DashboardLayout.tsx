
import React from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import { Home, LineChart, BarChart3, Wallet, CreditCard, TrendingUp, History, Settings } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // Navigation items for the sidebar
  const navItems = [
    { icon: Home, label: "Dashboard", id: "dashboard" },
    { icon: LineChart, label: "Markets", id: "markets" },
    { icon: BarChart3, label: "Trading", id: "trading" },
    { icon: Wallet, label: "Assets", id: "assets" },
    { icon: CreditCard, label: "Deposit/Withdraw", id: "funding" },
    { icon: TrendingUp, label: "Bots & Strategies", id: "bots" },
    { icon: History, label: "History", id: "history" },
    { icon: Settings, label: "Settings", id: "settings" },
  ];
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
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
  );
};

export default DashboardLayout;
