
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
      
      // Ensure symbol ends with USDT
      const formattedSymbol = symbol.endsWith('USDT') ? symbol : symbol.replace('USD', 'USDT');

      try {
        setError(null);
        const data = await fetchBinanceData(`depth?symbol=${formattedSymbol}&limit=20`);

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
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderBookProps {
  symbol: string;
}

interface OrderData {
  price: number;
  quantity: number;
  total: number;
}

const BinanceOrderBook = ({ symbol }: OrderBookProps) => {
  const [bids, setBids] = useState<OrderData[]>([]);
  const [asks, setAsks] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use a proxy to avoid CORS issues
        const response = await fetch(`/api/binance/depth?symbol=${symbol}&limit=10`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch order book: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transform bids data
        const transformedBids = data.bids.map((bid: string[]) => {
          const price = parseFloat(bid[0]);
          const quantity = parseFloat(bid[1]);
          return {
            price,
            quantity,
            total: price * quantity
          };
        });
        
        // Transform asks data
        const transformedAsks = data.asks.map((ask: string[]) => {
          const price = parseFloat(ask[0]);
          const quantity = parseFloat(ask[1]);
          return {
            price,
            quantity,
            total: price * quantity
          };
        });
        
        setBids(transformedBids);
        setAsks(transformedAsks);
      } catch (error) {
        console.error('Error fetching order book:', error);
        setError('Failed to load order book data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000);
    
    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-lg">{symbol} Order Book</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-center text-white/60 py-4">Loading order book...</div>}
        
        {error && <div className="text-center text-red-400 py-4">{error}</div>}
        
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-center text-green-400 font-semibold mb-2">Bids</div>
              <div className="grid grid-cols-3 gap-2 text-xs font-medium text-white/70 mb-1">
                <div>Price</div>
                <div>Amount</div>
                <div>Total</div>
              </div>
              <div className="space-y-1">
                {bids.map((bid, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-green-400">${bid.price.toFixed(2)}</div>
                    <div className="text-white/80">{bid.quantity.toFixed(4)}</div>
                    <div className="text-white/80">${bid.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-center text-red-400 font-semibold mb-2">Asks</div>
              <div className="grid grid-cols-3 gap-2 text-xs font-medium text-white/70 mb-1">
                <div>Price</div>
                <div>Amount</div>
                <div>Total</div>
              </div>
              <div className="space-y-1">
                {asks.map((ask, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-red-400">${ask.price.toFixed(2)}</div>
                    <div className="text-white/80">{ask.quantity.toFixed(4)}</div>
                    <div className="text-white/80">${ask.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BinanceOrderBook;
