
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface BinanceOrderBookProps {
  symbol: string;
}

const BinanceOrderBook = ({ symbol }: BinanceOrderBookProps) => {
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [orderBook, setOrderBook] = useState<{ bids: string[][], asks: string[][] }>({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const binanceSymbol = symbol.replace('USD', 'USDT');
        const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${binanceSymbol}&limit=5`);
        if (!response.ok) {
          throw new Error('Failed to fetch order book');
        }
        const data = await response.json();
        setOrderBook(data);
      } catch (err) {
        setError('Failed to load order book data');
        console.error('Error fetching order book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <Card className="bg-background/40 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full bg-white/10" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-background/40 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Order Book</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-background/40">
            <TabsTrigger value="buy" className="text-white">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="text-white">Sell</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 space-y-4">
            <div className="flex space-x-2">
              <Button
                variant={orderType === "market" ? "default" : "secondary"}
                onClick={() => setOrderType("market")}
                className="flex-1"
              >
                Market
              </Button>
              <Button
                variant={orderType === "limit" ? "default" : "secondary"}
                onClick={() => setOrderType("limit")}
                className="flex-1"
              >
                Limit
              </Button>
            </div>

            {orderType === "limit" && (
              <Input
                type="number"
                placeholder="Limit Price"
                className="bg-background/40"
              />
            )}

            <Input
              type="number"
              placeholder="Amount"
              className="bg-background/40"
            />

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                <div>Price</div>
                <div className="text-right">Amount</div>
              </div>
              
              {orderBook.asks.slice().reverse().map(([price, amount], i) => (
                <div key={`ask-${i}`} className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-red-400">{parseFloat(price).toFixed(2)}</div>
                  <div className="text-right text-white/70">{parseFloat(amount).toFixed(4)}</div>
                </div>
              ))}
              
              <div className="border-t border-white/10 my-2" />
              
              {orderBook.bids.map(([price, amount], i) => (
                <div key={`bid-${i}`} className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-green-400">{parseFloat(price).toFixed(2)}</div>
                  <div className="text-right text-white/70">{parseFloat(amount).toFixed(4)}</div>
                </div>
              ))}
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BinanceOrderBook;
