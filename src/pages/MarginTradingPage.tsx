
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { MarketOverview } from "@/components/markets/MarketOverview";
import { LivePriceTicker } from "@/components/markets/LivePriceTicker";
import { CryptoTicker } from "@/components/CryptoTicker";

const MarginTradingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trading');

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Margin Trading</h1>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <CryptoTicker />
        
        <LivePriceTicker />

        <Tabs defaultValue="trading" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="mt-4">
            <TradingPanel mode="margin" />
          </TabsContent>
          
          <TabsContent value="markets" className="mt-4">
            <MarketOverview />
          </TabsContent>

          <TabsContent value="positions" className="mt-4">
            <div className="text-white">Open positions will be displayed here</div>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <div className="text-white">Order history will be displayed here</div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MarginTradingPage;
