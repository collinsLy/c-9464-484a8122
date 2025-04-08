
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
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
    if (!apiKey) {
      console.error('Finnhub API key not found');
      return;
    }

    const socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

    socket.onopen = () => {
      console.log('Connected to Finnhub');
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
            const existingStock = prevStocks.find(s => s.symbol === symbol);
            const changePercent = existingStock 
              ? ((price - existingStock.price) / existingStock.price) * 100 
              : 0;

            if (!existingStock) {
              return [...prevStocks, { symbol, price, changePercent }];
            }

            return prevStocks.map(stock => 
              stock.symbol === symbol 
                ? { ...stock, price, changePercent } 
                : stock
            );
          });
        });
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        stockSymbols.forEach(symbol => {
          socket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
        });
        socket.close();
      }
    };
  }, []);

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle>Stock Ticker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] overflow-y-auto">
          <div className="space-y-2">
            {stocks.map((stock) => (
              <div
                key={stock.symbol}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{stock.symbol}</span>
                  <div className="text-right">
                    <div className="font-mono text-white">${stock.price.toFixed(2)}</div>
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
        </div>
      </CardContent>
    </Card>
  );
}
