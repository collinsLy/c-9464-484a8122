
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface PriceUpdate {
  symbol: string;
  price: number;
  previousPrice: number;
  timestamp: number;
  percentageChange: number;
}

export function LivePriceTicker({ symbol }: { symbol: string }) {
  const [priceHistory, setPriceHistory] = useState<PriceUpdate[]>([]);
  const [latestPrice, setLatestPrice] = useState<PriceUpdate | null>(null);

  useEffect(() => {
    const ws = symbol.includes('USDT') 
  ? new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`)
  : new WebSocket(`wss://ws.finnhub.io?token=${process.env.VITE_FINNHUB_API_KEY}`);

if (!symbol.includes('USDT')) {
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'subscribe', symbol: symbol }));
  };
}
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      let newPrice, previousPrice, percentageChange;
      
      if (symbol.includes('USDT')) {
        newPrice = parseFloat(data.p);
        previousPrice = priceHistory[0]?.price || newPrice;
        percentageChange = ((newPrice - previousPrice) / previousPrice) * 100;
      } else {
        if (data.type !== 'trade') return;
        newPrice = parseFloat(data.data[0].p);
        previousPrice = priceHistory[0]?.price || newPrice;
        percentageChange = ((newPrice - previousPrice) / previousPrice) * 100;
      }
      
      const update: PriceUpdate = {
        symbol: symbol,
        price: newPrice,
        previousPrice,
        timestamp: Date.now(),
        percentageChange
      };

      setLatestPrice(update);
      setPriceHistory(prev => [update, ...prev].slice(0, 10));
    };

    return () => ws.close();
  }, [symbol]);

  return (
    <div className="space-y-4">
      {/* Sticky Latest Price */}
      {latestPrice && (
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm p-4 border-b border-white/10">
          <div className={cn(
            "text-2xl font-bold transition-colors duration-500",
            latestPrice.price > latestPrice.previousPrice ? "text-green-500" : "text-red-500"
          )}>
            ${latestPrice.price.toFixed(2)}
          </div>
        </div>
      )}

      {/* Scrolling Price History */}
      <div className="space-y-2 animate-scroll">
        {priceHistory.map((update, index) => (
          <div
            key={update.timestamp}
            className={cn(
              "p-3 rounded-lg transition-all duration-500",
              update.percentageChange > 5 ? "animate-pulse" : "",
              update.price > update.previousPrice ? "bg-green-500/10" : "bg-red-500/10"
            )}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{update.symbol}</span>
              <div className="space-x-2">
                <span className="font-mono">${update.price.toFixed(2)}</span>
                <span className={cn(
                  "text-sm",
                  update.percentageChange >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {update.percentageChange >= 0 ? "+" : ""}{update.percentageChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
