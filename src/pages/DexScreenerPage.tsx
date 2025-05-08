// src/pages/DexScreenerPage.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowUpRight, Shield, Clock, AlertTriangle, TrendingUp, DollarSign, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DexTokenAlert from "@/components/markets/DexTokenAlert";
import { toast } from "sonner";
import { DexPair, fetchPairsByChain } from "@/lib/dexscreener-service";

const DexScreenerPage = () => {
  const [pairs, setPairs] = useState<DexPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const data = await fetchPairsByChain('ethereum'); //Example chain, needs to be configurable
        setPairs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPairs();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">New listing pairs</h1>
            <p className="text-sm text-white/70 mt-1">Monitor newly listed decentralized exchange pairs</p>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border border-white/10 bg-background/40 backdrop-blur-sm">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pairs.map((pair) => (
              <DexTokenAlert key={pair.pairAddress} pair={pair} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DexScreenerPage;