
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriceData {
  symbol: string;
  price: number;
  priceChange: string;
}

interface PriceUpdateSymbol {
  symbol: string;
  price: number;
  previousPrice: number;
  timestamp: number;
  percentageChange: number;
}

export function LivePriceTicker({ symbol }: { symbol?: string }) {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceUpdateSymbol[]>([]);
  const [latestPrice, setLatestPrice] = useState<PriceUpdateSymbol | null>(null);
  
  // For the single symbol ticker display
  useEffect(() => {
    if (!symbol) return;
    
    const ws = symbol.includes('USDT') 
      ? new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`)
      : new WebSocket(`wss://ws.finnhub.io?token=${import.meta.env.VITE_FINNHUB_API_KEY}`);

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
      
      const update: PriceUpdateSymbol = {
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
  
  // For the multi-symbol ticker display
  useEffect(() => {
    if (symbol) return; // Don't run this effect if a specific symbol is provided
    
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'DOGEUSDT'];
    
    const fetchPrices = async () => {
      try {
        const responses = await Promise.all(
          symbols.map(symbol =>
            fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
              .then(res => res.json())
          )
        );
        
        const formattedData = responses.map(data => ({
          symbol: data.symbol.replace('USDT', ''),
          price: parseFloat(data.lastPrice),
          priceChange: data.priceChangePercent
        }));
        
        setPrices(formattedData);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, [symbol]);

  // Render the single symbol ticker with history
  const renderSingleTicker = () => (
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

  // Render the multi-symbol ticker
  const renderMultiTicker = () => (
    <Card className="w-full bg-background/20 border-0">
      <CardHeader>
        <CardTitle className="text-white">Live Market Prices</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {prices.map((item) => (
            <Card key={item.symbol} className="bg-background/40 border-white/10 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-white">{item.symbol}</span>
                  <Badge variant={parseFloat(item.priceChange) >= 0 ? "success" : "destructive"} className="text-xs">
                    {parseFloat(item.priceChange) >= 0 ? '+' : ''}{item.priceChange}%
                  </Badge>
                </div>
                <p className="text-lg font-bold text-white mt-1">${item.price.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // If a symbol is specified, show the single ticker with history
  // Otherwise, show the multi-symbol ticker
  return symbol ? renderSingleTicker() : renderMultiTicker();
}
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface LivePriceTickerProps {
  symbol?: string;
}

export const LivePriceTicker = ({ symbol = "BTCUSDT" }: LivePriceTickerProps) => {
  const [price, setPrice] = useState<number | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [isIncreasing, setIsIncreasing] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        if (!response.ok) throw new Error('Failed to fetch price');
        const data = await response.json();
        
        setPrevPrice(price);
        setPrice(parseFloat(data.price));
        
        if (prevPrice !== null && price !== null) {
          setIsIncreasing(price > prevPrice);
        }
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    
    return () => clearInterval(interval);
  }, [symbol, price, prevPrice]);

  if (price === null) {
    return (
      <Card className="bg-background/40 backdrop-blur-lg border-white/10">
        <CardContent className="p-4">
          <div className="text-center text-white/60">Loading price data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="text-white/70">{symbol} Live Price</div>
          <div className={`flex items-center ${isIncreasing === null ? '' : isIncreasing ? 'text-green-400' : 'text-red-400'}`}>
            {isIncreasing !== null && (
              isIncreasing ? 
                <ArrowUpRight className="h-4 w-4 mr-1" /> : 
                <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            <span className="font-bold">${price.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
