import { useState, useEffect } from 'react';
import { binanceService } from '@/lib/binance-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BinanceOrderBookProps {
  symbol: string;
}

const BinanceOrderBook = ({ symbol }: BinanceOrderBookProps) => {
  const [orderBook, setOrderBook] = useState<{ bids: string[][], asks: string[][] }>({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderBook = async () => {
      setLoading(true);
      try {
        const data = await binanceService.getOrderBook(symbol);
        setOrderBook(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white/70">Order Book</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-red-500 mb-2">Asks</h3>
            {orderBook.asks.slice(0, 5).map(([price, amount], i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-red-500">{Number(price).toFixed(2)}</span>
                <span className="text-white/70">{Number(amount).toFixed(6)}</span>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-green-500 mb-2">Bids</h3>
            {orderBook.bids.slice(0, 5).map(([price, amount], i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-green-500">{Number(price).toFixed(2)}</span>
                <span className="text-white/70">{Number(amount).toFixed(6)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BinanceOrderBook;