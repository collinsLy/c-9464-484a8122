
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
}

export const MarketOverview = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true');
        const data = await response.json();
        
        const formattedData = Object.entries(data).map(([key, value]: [string, any]) => ({
          symbol: key.toUpperCase(),
          price: value.usd,
          change24h: value.usd_24h_change,
          volume: value.usd_24h_vol
        }));

        setMarketData(formattedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch market data');
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardContent className="p-4">
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardContent className="p-4 text-center text-red-400">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="symbol" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#000000dd',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="change24h" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle>Top Movers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).map((item) => (
              <div key={item.symbol} className="flex justify-between items-center">
                <span>{item.symbol}</span>
                <span className={item.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {item.change24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOverview;
