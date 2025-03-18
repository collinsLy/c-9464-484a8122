
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip
} from "recharts";

const MarketOverview = () => {
  // Sample market data
  const marketData = [
    { name: "BTC", price: 65432.21, change: 2.3, volume: 32.5 },
    { name: "ETH", price: 3245.67, change: 1.7, volume: 24.8 },
    { name: "SOL", price: 152.43, change: 3.5, volume: 18.2 },
    { name: "BNB", price: 605.78, change: -0.8, volume: 15.4 },
    { name: "ADA", price: 0.59, change: -2.1, volume: 12.1 },
    { name: "DOT", price: 8.72, change: 1.2, volume: 8.7 },
    { name: "XRP", price: 0.63, change: 0.5, volume: 7.3 },
    { name: "DOGE", price: 0.12, change: 5.2, volume: 6.8 },
  ];

  const marketCapData = [
    { name: "Jan", btc: 800, eth: 300, sol: 100 },
    { name: "Feb", btc: 830, eth: 320, sol: 110 },
    { name: "Mar", btc: 870, eth: 350, sol: 130 },
    { name: "Apr", btc: 820, eth: 340, sol: 120 },
    { name: "May", btc: 880, eth: 360, sol: 150 },
    { name: "Jun", btc: 910, eth: 380, sol: 170 },
    { name: "Jul", btc: 950, eth: 410, sol: 190 },
  ];

  const chartConfig = {
    btc: { label: "Bitcoin", theme: { light: "#f7931a", dark: "#f7931a" } },
    eth: { label: "Ethereum", theme: { light: "#627eea", dark: "#627eea" } },
    sol: { label: "Solana", theme: { light: "#00ffbd", dark: "#00ffbd" } },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white col-span-2">
        <CardHeader>
          <CardTitle>Market Capitalization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <AreaChart data={marketCapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="btc" 
                  name="btc"
                  stroke="var(--color-btc)" 
                  fill="var(--color-btc)" 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="eth" 
                  name="eth"
                  stroke="var(--color-eth)" 
                  fill="var(--color-eth)" 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sol" 
                  name="sol"
                  stroke="var(--color-sol)" 
                  fill="var(--color-sol)" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle>Top Gainers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData
              .filter(crypto => crypto.change > 0)
              .sort((a, b) => b.change - a.change)
              .slice(0, 4)
              .map(crypto => (
                <div key={crypto.name} className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div className="font-medium">{crypto.name}</div>
                  <div className="text-right">
                    <div>${crypto.price.toLocaleString()}</div>
                    <div className="text-green-400">+{crypto.change}%</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle>Top Losers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData
              .filter(crypto => crypto.change < 0)
              .sort((a, b) => a.change - b.change)
              .slice(0, 4)
              .map(crypto => (
                <div key={crypto.name} className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div className="font-medium">{crypto.name}</div>
                  <div className="text-right">
                    <div>${crypto.price.toLocaleString()}</div>
                    <div className="text-red-400">{crypto.change}%</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white col-span-2">
        <CardHeader>
          <CardTitle>Trading Volume (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111', 
                    borderColor: '#333',
                    color: '#fff'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar 
                  dataKey="volume" 
                  name="Volume (Billion USD)" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOverview;
