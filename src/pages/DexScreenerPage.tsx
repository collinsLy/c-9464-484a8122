// pages/dexscreener.tsx
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
import { DexTokenAlert } from "@/components/markets/DexTokenAlert";
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <DashboardLayout>
      <div>
        <h1>Dex Screener</h1>
        <div>
          {pairs.map((pair) => (
            <DexTokenAlert key={pair.pairAddress} pair={pair} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DexScreenerPage;