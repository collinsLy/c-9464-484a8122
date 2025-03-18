
import React, { useState, createContext, useContext } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import { 
  Home, LineChart, BarChart3, Wallet, CreditCard, 
  TrendingUp, History, Settings, PlayCircle
} from "lucide-react";

// Create a context for dashboard state
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

// Create a hook to use the dashboard context
export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return context;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // State for demo mode
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Function to toggle demo mode
  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };
  
  // Navigation items for the sidebar with proper paths
  const navItems = [
    { icon: Home, label: "Dashboard", id: "dashboard", path: "/dashboard" },
    { icon: LineChart, label: "Markets", id: "markets", path: "/market" },
    { icon: BarChart3, label: "Trading", id: "trading", path: "/dashboard?tab=trading" },
    { icon: Wallet, label: "Assets", id: "assets", path: "/assets" },
    { icon: PlayCircle, label: "Demo", id: "demo", path: "/demo" },
    { icon: CreditCard, label: "Deposit/Withdraw", id: "funding", path: "/dashboard?tab=funding" },
    { icon: TrendingUp, label: "Bots & Strategies", id: "bots", path: "/dashboard?tab=bots" },
    { icon: History, label: "History", id: "history", path: "/dashboard?tab=history" },
    { icon: Settings, label: "Settings", id: "settings", path: "/settings" },
  ];
  
  return (
    <DashboardContext.Provider value={{ isDemoMode, toggleDemoMode }}>
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
    </DashboardContext.Provider>
  );
};

export default DashboardLayout;
