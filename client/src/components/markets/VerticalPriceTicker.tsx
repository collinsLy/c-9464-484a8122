
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface PriceData {
  symbol: string;
  price: number;
  previousPrice: number | null;
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'DOGEUSDT', 'ADAUSDT', 'DOTUSDT', 'MATICUSDT'];

export function VerticalPriceTicker() {
  const [prices, setPrices] = useState<PriceData[]>([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const responses = await Promise.all(
          SYMBOLS.map(symbol =>
            fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
              .then(res => res.json())
          )
        );

        setPrices(prevPrices => {
          return responses.map(response => ({
            symbol: response.symbol.replace('USDT', ''),
            price: parseFloat(response.price),
            previousPrice: prevPrices.find(p => p.symbol === response.symbol.replace('USDT', ''))?.price || null
          }));
        });
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-[400px] overflow-hidden bg-background/40 backdrop-blur-lg border-white/10">
      <div className="h-full overflow-hidden">
        <div className="animate-scroll space-y-2 p-4">
          {prices.map((price) => (
            <div
              key={price.symbol}
              className="flex justify-between items-center p-2 rounded-lg transition-colors"
            >
              <span className="font-medium text-sm">{price.symbol}</span>
              <span
                className={`font-mono text-sm ${
                  price.previousPrice
                    ? price.price > price.previousPrice
                      ? 'text-green-500'
                      : price.price < price.previousPrice
                      ? 'text-red-500'
                      : 'text-white'
                    : 'text-white'
                }`}
              >
                ${price.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
