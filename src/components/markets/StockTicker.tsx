
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export function StockTicker() {
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'TSLA', 'NVDA', 'IBM'];
  
  useEffect(() => {
    const ws = new WebSocket(`wss://ws.finnhub.io?token=${import.meta.env.VITE_FINNHUB_API_KEY}`);

    ws.onopen = () => {
      stockSymbols.forEach(symbol => {
        ws.send(JSON.stringify({ type: 'subscribe', symbol: symbol }));
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'trade') {
        const symbol = data.data[0].s;
        setStocks(prev => {
          const newStocks = [...prev];
          const index = newStocks.findIndex(s => s.symbol === symbol);
          const newPrice = data.data[0].p;
          
          if (index !== -1) {
            const oldPrice = newStocks[index].price;
            newStocks[index] = {
              symbol,
              price: newPrice,
              change: newPrice - oldPrice,
              changePercent: ((newPrice - oldPrice) / oldPrice) * 100
            };
          } else {
            newStocks.push({
              symbol,
              price: newPrice,
              change: 0,
              changePercent: 0
            });
          }
          return newStocks;
        });
      }
    };

    return () => ws.close();
  }, []);

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 h-[300px] mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Stock Ticker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-y-auto h-[220px] space-y-2 smooth-scroll">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="p-2 rounded-lg transition-all duration-300 hover:bg-white/5"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{stock.symbol}</span>
                <div className="space-x-4">
                  <span className="font-mono">${stock.price.toFixed(2)}</span>
                  <span
                    className={`text-sm ${
                      stock.changePercent >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stock.changePercent >= 0 ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
