import { useState, useEffect } from 'react';
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
    const fetchStockData = async () => {
      try {
        const results = await Promise.all(
          stockSymbols.map(async (symbol) => {
            const response = await fetch(
              `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=KD8VEONNC7ZSMKQO`
            );
            const data = await response.json();

            if (data['Global Quote']) {
              return {
                symbol,
                price: parseFloat(data['Global Quote']['05. price']),
                changePercent: parseFloat(data['Global Quote']['10. change percent'].replace('%', ''))
              };
            }
            return null;
          })
        );

        setStocks(results.filter((stock): stock is StockPrice => stock !== null));
      } catch (error) {
        console.error('Failed to fetch stock data:', error);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle>Stock Ticker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[440px] overflow-y-auto">
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