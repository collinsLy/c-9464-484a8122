
import { useState } from "react";
import DashboardLayout, { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import AccountOverview from "@/components/dashboard/AccountOverview";
import MarketChart from "@/components/dashboard/MarketChart";
import AssetsList from "@/components/dashboard/AssetsList";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import TradingPanel from "@/components/dashboard/TradingPanel";
import AutomatedTrading from "@/components/dashboard/AutomatedTrading";
import DemoModeToggle from "@/components/dashboard/DemoModeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const { isDemoMode } = useDashboardContext();
  
  return (
    <DashboardLayout>
      {/* Demo Mode Toggle Card */}
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardContent className="pt-6">
          <DemoModeToggle />
        </CardContent>
      </Card>
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-background/40 border border-white/10 p-1 mb-6">
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
        <TabsContent value="overview" className="space-y-6">
          {/* Account Overview Cards */}
          <AccountOverview isDemoMode={isDemoMode} />
          
          {/* Market Chart and Assets Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <MarketChart selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />
            </div>
            <div className="xl:col-span-1">
              <AssetsList isDemoMode={isDemoMode} />
            </div>
          </div>
          
          {/* Recent Transactions */}
          <TransactionHistory isDemoMode={isDemoMode} />
        </TabsContent>
        
        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <MarketChart selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />
            </div>
            <div className="xl:col-span-1">
              <TradingPanel symbol={selectedSymbol} isDemoMode={isDemoMode} />
            </div>
          </div>
        </TabsContent>
        
        {/* Bot Trading Tab */}
        <TabsContent value="bots">
          <AutomatedTrading isDemoMode={isDemoMode} />
        </TabsContent>
        
        {/* Transaction History Tab */}
        <TabsContent value="history">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Transaction History</h2>
          </div>
          <TransactionHistory isDemoMode={isDemoMode} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Dashboard;
