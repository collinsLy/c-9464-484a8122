
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TickerData {
  symbol: string;
  price: number;
  previousPrice: number;
  type: 'stock' | 'forex' | 'etf';
}

export function TwelveDataTicker() {
  const [marketData, setMarketData] = useState<Record<string, TickerData>>({});
  
  const symbols = {
    stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
    forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD'],
    etfs: ['SPY', 'QQQ', 'IWM', 'VTI']
  };

  useEffect(() => {
    const ws = new WebSocket('wss://ws.twelvedata.com/v1/quotes/price');

    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        params: {
          symbols: [...symbols.stocks, ...symbols.forex, ...symbols.etfs].join(','),
          apikey: 'bd6542a7833b4e4ebb503631cc1cb780'
        }
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.price && data.symbol) {
        setMarketData(prev => {
          const type = symbols.stocks.includes(data.symbol) ? 'stock' 
            : symbols.forex.includes(data.symbol) ? 'forex' 
            : 'etf';
            
          return {
            ...prev,
            [data.symbol]: {
              symbol: data.symbol,
              price: parseFloat(data.price),
              previousPrice: prev[data.symbol]?.price || parseFloat(data.price),
              type
            }
          };
        });
      }
    };

    return () => ws.close();
  }, []);

  const renderSection = (title: string, type: 'stock' | 'forex' | 'etf') => (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-white/90">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.values(marketData)
          .filter(data => data.type === type)
          .map(data => (
            <div
              key={data.symbol}
              className="p-3 rounded-lg bg-white/5 border border-white/10 transition-colors duration-300"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">{data.symbol}</span>
                <div className="text-right">
                  <div 
                    className={`font-mono transition-colors duration-300 ${
                      data.price > data.previousPrice ? 'text-green-400' 
                      : data.price < data.previousPrice ? 'text-red-400' 
                      : 'text-white'
                    }`}
                  >
                    ${data.price.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle>Market Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderSection('Stocks', 'stock')}
        {renderSection('Forex', 'forex')}
        {renderSection('ETFs', 'etf')}
      </CardContent>
    </Card>
  );
}
