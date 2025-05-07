
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type AlertCondition = 'above' | 'below';

interface PriceAlert {
  id: string;
  symbol: string;
  price: number;
  condition: AlertCondition;
  createdAt: Date;
}

export function PriceAlertForm() {
  const [symbol, setSymbol] = useState('BTC');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  const createAlert = () => {
    if (!price || parseFloat(price) <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol,
      price: parseFloat(price),
      condition,
      createdAt: new Date()
    };

    setAlerts([...alerts, newAlert]);
    setPrice('');

    toast({
      title: "Alert created",
      description: `You will be notified when ${symbol} goes ${condition} $${price}`,
    });

    // In a real implementation, you would save this to a database
    // and set up a service to check prices and send notifications
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast({
      title: "Alert deleted",
    });
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <CardTitle>Price Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="bg-background/40 border-white/10 text-white">
                <SelectValue placeholder="Select coin" />
              </SelectTrigger>
              <SelectContent className="bg-background border-white/10 text-white">
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                <SelectItem value="SOL">Solana (SOL)</SelectItem>
                <SelectItem value="USDT">Tether (USDT)</SelectItem>
                <SelectItem value="WLD">Worldcoin (WLD)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={condition} onValueChange={(val) => setCondition(val as AlertCondition)}>
              <SelectTrigger className="bg-background/40 border-white/10 text-white">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent className="bg-background border-white/10 text-white">
                <SelectItem value="above">Price Above</SelectItem>
                <SelectItem value="below">Price Below</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="bg-background/40 border-white/10 text-white"
            />

            <Button 
              onClick={createAlert}
              className="w-full bg-accent hover:bg-accent/90 text-white"
            >
              Create Alert
            </Button>
          </div>

          {alerts.length > 0 && (
            <div className="rounded-md border border-white/10 mt-4">
              <div className="grid grid-cols-4 bg-background/60 p-3 rounded-t-md">
                <div>Coin</div>
                <div>Condition</div>
                <div>Price</div>
                <div className="text-right">Actions</div>
              </div>
              {alerts.map((alert) => (
                <div key={alert.id} className="grid grid-cols-4 p-3 border-t border-white/10">
                  <div>{alert.symbol}</div>
                  <div>{alert.condition === 'above' ? 'Above' : 'Below'}</div>
                  <div>${alert.price.toFixed(2)}</div>
                  <div className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
