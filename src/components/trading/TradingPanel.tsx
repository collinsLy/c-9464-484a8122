
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface TradingPanelProps {
  symbol: string;
  currentPrice: number;
  isDemoMode?: boolean;
}

export const TradingPanel = ({ symbol, currentPrice, isDemoMode = false }: TradingPanelProps) => {
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [orderType, setOrderType] = useState('market');
  const { toast } = useToast();
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };
  
  const calculateTotal = () => {
    const amountVal = parseFloat(amount) || 0;
    const priceVal = orderType === 'market' ? currentPrice : (parseFloat(price) || 0);
    return (amountVal * priceVal).toFixed(2);
  };
  
  const handleTrade = (type: 'buy' | 'sell') => {
    const total = calculateTotal();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to trade.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: `${isDemoMode ? 'Demo ' : ''}${type.toUpperCase()} Order Executed`,
      description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amount} ${symbol.substring(0, 3)} for $${total}`,
    });
    
    setAmount('');
    setPrice('');
  };

  return (
    <Card className="bg-black/40 border-white/5">
      <CardHeader>
        <CardTitle>Trade {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="market" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="market" onClick={() => setOrderType('market')} className="w-full">
              Market
            </TabsTrigger>
            <TabsTrigger value="limit" onClick={() => setOrderType('limit')} className="w-full">
              Limit
            </TabsTrigger>
          </TabsList>
          <TabsContent value="market">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60">Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="text-sm text-white/60">Market Price</label>
                <Input value={currentPrice} disabled />
              </div>
              <div>
                <label className="text-sm text-white/60">Total</label>
                <Input value={`$${calculateTotal()}`} disabled />
              </div>
              <div className="flex gap-4">
                <Button onClick={() => handleTrade('buy')} className="w-full">
                  Buy
                </Button>
                <Button onClick={() => handleTrade('sell')} variant="destructive" className="w-full">
                  Sell
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="limit">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60">Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="text-sm text-white/60">Limit Price</label>
                <Input
                  type="number"
                  value={price}
                  onChange={handlePriceChange}
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="text-sm text-white/60">Total</label>
                <Input value={`$${calculateTotal()}`} disabled />
              </div>
              <div className="flex gap-4">
                <Button onClick={() => handleTrade('buy')} className="w-full">
                  Buy
                </Button>
                <Button onClick={() => handleTrade('sell')} variant="destructive" className="w-full">
                  Sell
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
