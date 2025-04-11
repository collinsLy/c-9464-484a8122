import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const MarketOverview = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'DOTUSDT', 'XRPUSDT', 'DOGEUSDT'];
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=' + JSON.stringify(symbols));
        if (!response.ok) {
          setMarketData([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const formattedData = data.map(item => ({
          name: item.symbol.replace('USDT', ''),
          price: parseFloat(item.lastPrice),
          change: parseFloat(item.priceChangePercent),
          volume: parseFloat(item.volume) * parseFloat(item.lastPrice) / 1e9, // Convert to billions
        }));

        setMarketData(formattedData);
        setLoading(false);
      } catch (err) {
        setMarketData([]);
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading || error) {
    return (
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="text-white/70">Loading market data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.map((coin) => (
              <div key={coin.name} className="flex flex-wrap justify-between items-center gap-2">
                <span className="font-medium text-sm sm:text-base">{coin.name}/USDT</span>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <span>${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className={coin.change >= 0 ? "text-green-500" : "text-red-500"}>
                    {coin.change >= 0 ? "+" : ""}{coin.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
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