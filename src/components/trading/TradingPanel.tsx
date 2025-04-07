
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { binanceService } from '@/lib/binance-service';

export const TradingPanel = ({ symbol }: { symbol: string }) => {
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');

  const handleTrade = async (side: 'BUY' | 'SELL') => {
    try {
      if (orderType === 'market') {
        await binanceService.placeBuyOrder(symbol, parseFloat(amount));
      } else if (orderType === 'limit') {
        await binanceService.placeBuyOrder(symbol, parseFloat(amount), parseFloat(price));
      }
      // Add notification of success
    } catch (error) {
      console.error('Trade failed:', error);
      // Add error notification
    }
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="market">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="limit">Limit</TabsTrigger>
            <TabsTrigger value="stop">Stop</TabsTrigger>
          </TabsList>
          
          <TabsContent value="market" className="space-y-4">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleTrade('BUY')} className="bg-green-500">
                Buy
              </Button>
              <Button onClick={() => handleTrade('SELL')} className="bg-red-500">
                Sell
              </Button>
            </div>
          </TabsContent>
          
          {/* Add other order type content */}
        </Tabs>
      </CardContent>
    </Card>
  );
};
