
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MarketOverview } from "@/components/markets/MarketOverview";
import { LivePriceTicker } from "@/components/markets/LivePriceTicker";
import { CryptoTicker } from "@/components/CryptoTicker";

const FuturesMarketsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeZone, setActiveZone] = useState('all');

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Futures Markets</h1>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search futures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <CryptoTicker />
        
        <LivePriceTicker />

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveZone}>
          <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="USDⓈ-M">USDⓈ-M</TabsTrigger>
            <TabsTrigger value="COIN-M">COIN-M</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <MarketOverview />
          </TabsContent>
          
          <TabsContent value="USDⓈ-M" className="mt-4">
            <MarketOverview />
          </TabsContent>

          <TabsContent value="COIN-M" className="mt-4">
            <MarketOverview />
          </TabsContent>

          <TabsContent value="options" className="mt-4">
            <MarketOverview />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FuturesMarketsPage;
