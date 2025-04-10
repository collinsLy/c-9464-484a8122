
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { fetchBinanceData } from "@/lib/api-proxy";

interface BinanceOrderBookProps {
  symbol: string;
}

interface OrderData {
  price: string;
  amount: string;
  total?: number;
  isNew?: boolean;
  hasChanged?: boolean;
}

const BinanceOrderBook = ({ symbol }: BinanceOrderBookProps) => {
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [orderBook, setOrderBook] = useState<{ bids: OrderData[], asks: OrderData[] }>({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processOrders = useCallback((orders: string[][], prevOrders: OrderData[] = []): OrderData[] => {
    return orders.slice(0, 15).map((order, i) => {
      const [price, amount] = order;
      const prevOrder = prevOrders[i];
      const total = parseFloat(amount) * parseFloat(price);

      return {
        price,
        amount,
        total,
        isNew: !prevOrder,
        hasChanged: prevOrder && (prevOrder.price !== price || prevOrder.amount !== amount)
      };
    });
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const updateInterval = 1000;

    const fetchOrderBook = async () => {
      if (!symbol) return;

      try {
        setError(null);
        const data = await fetchBinanceData(`depth?symbol=${symbol}&limit=20`);

        if (!data || !data.bids || !data.asks) {
          throw new Error('Invalid order book data received');
        }

        setOrderBook(prev => ({
          bids: processOrders(data.bids, prev.bids),
          asks: processOrders(data.asks, prev.asks)
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order book';
        setError(errorMessage);
        console.error('Error fetching order book:', err);
      } finally {
        setLoading(false);
        timeoutId = setTimeout(fetchOrderBook, updateInterval);
      }
    };

    fetchOrderBook();
    return () => clearTimeout(timeoutId);
  }, [symbol, processOrders]);

  const renderOrders = (orders: OrderData[], isAsk: boolean) => (
    <div className="space-y-1 h-[300px] overflow-y-auto">
      {orders.map((order, i) => (
        <div 
          key={`${order.price}-${i}`}
          className={cn(
            "grid grid-cols-1 gap-2 text-sm relative transition-all duration-200",
            order.isNew && "animate-fade-in",
            order.hasChanged && (isAsk ? "bg-red-500/10" : "bg-green-500/10")
          )}
          style={{
            opacity: Math.max(0.4, 1 - (i * 0.05))
          }}
        >
          <div className="absolute left-0 h-full bg-accent/10" 
               style={{ 
                 width: `${(order.total || 0) / (Math.max(...orders.map(o => o.total || 0)) || 1) * 100}%`,
                 backgroundColor: isAsk ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'
               }} />
          <div className="text-center text-white/70 z-10">
            {parseFloat(order.amount).toFixed(4)}
          </div>
        </div>
      ))}
    </div>
  );

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

              {renderOrders(orderBook.asks.slice().reverse(), true)}
              <div className="border-t border-white/10 my-2" />
              {renderOrders(orderBook.bids, false)}
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BinanceOrderBook;
