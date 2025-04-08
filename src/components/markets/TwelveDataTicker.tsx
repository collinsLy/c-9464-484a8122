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
    const fetchPrices = async () => {
      try {
        const allSymbols = [...symbols.stocks, ...symbols.forex, ...symbols.etfs];
        const response = await fetch(
          `https://api.twelvedata.com/price?symbol=${allSymbols.join(',')}&apikey=bd6542a7833b4e4ebb503631cc1cb780`
        );
        const data = await response.json();

        setMarketData(prev => {
          const newData: Record<string, TickerData> = {};
          for (const symbol in data) {
            const type = symbols.stocks.includes(symbol) ? 'stock' 
              : symbols.forex.includes(symbol) ? 'forex' 
              : 'etf';

            newData[symbol] = {
              symbol,
              price: parseFloat(data[symbol].price),
              previousPrice: prev[symbol]?.price || parseFloat(data[symbol].price),
              type
            };
          }
          return newData;
        });
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
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
        <CardTitle>Live Market Data</CardTitle>
        {Object.keys(marketData).length === 0 && (
          <div className="text-sm text-white/70">Loading market data...</div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {renderSection('Stocks', 'stock')}
        {renderSection('Forex', 'forex')}
        {renderSection('ETFs', 'etf')}
      </CardContent>
    </Card>
  );
}