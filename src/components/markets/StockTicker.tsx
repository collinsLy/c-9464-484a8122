
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StockPrice {
  symbol: string;
  price: number;
  changePercent: number;
}

export function StockTicker() {
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'TSLA', 'NVDA', 'IBM'];

  useEffect(() => {
    const socket = new WebSocket(`wss://ws.finnhub.io?token=${import.meta.env.VITE_FINNHUB_API_KEY}`);
    let lastPrices = new Map<string, number>();

    socket.onopen = () => {
      stockSymbols.forEach(symbol => {
        socket.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'trade') {
        data.data.forEach((trade: any) => {
          const symbol = trade.s;
          const price = trade.p;
          
          setStocks(prevStocks => {
            const stockIndex = prevStocks.findIndex(s => s.symbol === symbol);
            const lastPrice = lastPrices.get(symbol) || price;
            const changePercent = ((price - lastPrice) / lastPrice) * 100;
            
            lastPrices.set(symbol, price);
            
            if (stockIndex === -1) {
              return [...prevStocks, { symbol, price, changePercent }];
            }
            
            const newStocks = [...prevStocks];
            newStocks[stockIndex] = { symbol, price, changePercent };
            return newStocks;
          });
        });
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-lg text-white">Stock Ticker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] overflow-hidden">
          <div className="space-y-2 animate-scroll">
            {stocks.map((stock) => (
              <div
                key={stock.symbol}
                className="p-3 rounded-lg bg-white/5 border-b border-white/10"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{stock.symbol}</span>
                  <div className="text-right">
                    <div className="font-mono text-white">${stock.price.toFixed(2)}</div>
                    <div
                      className={`text-sm ${
                        stock.changePercent >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
