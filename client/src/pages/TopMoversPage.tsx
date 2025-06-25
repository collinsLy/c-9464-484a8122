
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MarketOverview } from "@/components/markets/MarketOverview";
import { LivePriceTicker } from "@/components/markets/LivePriceTicker";
import { CryptoTicker } from "@/components/CryptoTicker";

const TopMoversPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeZone, setActiveZone] = useState('all');

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Top Movers</h1>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
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
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
            <TabsTrigger value="volume">By Volume</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <MarketOverview />
          </TabsContent>
          
          <TabsContent value="gainers" className="mt-4">
            <MarketOverview />
          </TabsContent>

          <TabsContent value="losers" className="mt-4">
            <MarketOverview />
          </TabsContent>

          <TabsContent value="volume" className="mt-4">
            <MarketOverview />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TopMoversPage;
