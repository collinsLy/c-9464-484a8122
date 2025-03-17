
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AccountOverview from "@/components/dashboard/AccountOverview";
import MarketChart from "@/components/dashboard/MarketChart";
import AssetsList from "@/components/dashboard/AssetsList";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import TradingPanel from "@/components/dashboard/TradingPanel";
import AutomatedTrading from "@/components/dashboard/AutomatedTrading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  
  return (
    <DashboardLayout>
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
        <TabsContent value="trading" className="space-y-6">
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
        <TabsContent value="bots">
          <AutomatedTrading />
        </TabsContent>
        
        {/* Transaction History Tab */}
        <TabsContent value="history">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Transaction History</h2>
          </div>
          <TransactionHistory />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Dashboard;
