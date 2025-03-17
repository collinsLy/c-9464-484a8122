
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AccountOverview from "@/components/dashboard/AccountOverview";
import MarketChart from "@/components/dashboard/MarketChart";
import AssetsList from "@/components/dashboard/AssetsList";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import TradingPanel from "@/components/dashboard/TradingPanel";
import { Wallet, CreditCard, TrendingUp, Home, LineChart, BarChart3, Settings, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  
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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar navItems={navItems} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader />
        
        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Dashboard Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto bg-background/40 border border-white/10 p-1">
                <TabsTrigger value="overview" className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="trading" className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Trading
                </TabsTrigger>
                <TabsTrigger value="bots" className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Bot Trading
                </TabsTrigger>
                <TabsTrigger value="history" className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                  Transaction History
                </TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Account Overview Cards */}
                <AccountOverview />
                
                {/* Market Chart and Assets Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  <div className="xl:col-span-3">
                    <MarketChart selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />
                  </div>
                  <div className="xl:col-span-1">
                    <AssetsList />
                  </div>
                </div>
                
                {/* Recent Transactions */}
                <TransactionHistory />
              </TabsContent>
              
              {/* Trading Tab */}
              <TabsContent value="trading" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  <div className="xl:col-span-3">
                    <MarketChart selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />
                  </div>
                  <div className="xl:col-span-1">
                    <TradingPanel symbol={selectedSymbol} />
                  </div>
                </div>
              </TabsContent>
              
              {/* Bot Trading Tab */}
              <TabsContent value="bots" className="mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Automated Trading</h2>
                </div>
                {/* Import and use the AutomatedTrading component */}
                <iframe src="/dashboard?embed=automatedTrading" className="w-full h-[800px] border-0" />
              </TabsContent>
              
              {/* Transaction History Tab */}
              <TabsContent value="history" className="mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                </div>
                <TransactionHistory />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

