
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertService } from "@/lib/alert-service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PriceAlertFormProps {
  currentPrices: Record<string, number>;
}

const PriceAlertForm = ({ currentPrices }: PriceAlertFormProps) => {
  const [symbol, setSymbol] = useState('BTCUSD');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetPrice) {
      toast.error("Please enter a target price");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await AlertService.createPriceAlert(
        symbol,
        parseFloat(targetPrice),
        condition
      );

      if (result) {
        // Reset form on success
        setTargetPrice('');
      }
    } catch (error) {
      console.error("Error creating alert:", error);
      toast.error("Failed to create alert. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);

    // Pre-fill with current price for convenience
    const currentPrice = currentPrices[newSymbol] || 0;
    if (currentPrice > 0) {
      setTargetPrice(currentPrice.toFixed(2));
    }
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Create Price Alert</CardTitle>
        <CardDescription className="text-white/70">
          Get notified when a cryptocurrency reaches your target price
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol" className="text-white">Cryptocurrency</Label>
            <Select value={symbol} onValueChange={handleSymbolChange}>
              <SelectTrigger id="symbol" className="bg-background/40 border-white/20 text-white">
                <SelectValue placeholder="Select cryptocurrency" />
              </SelectTrigger>
              <SelectContent className="bg-background/90 backdrop-blur-lg border-white/20 text-white">
                <SelectItem value="BTCUSD">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETHUSD">Ethereum (ETH)</SelectItem>
                <SelectItem value="SOLUSD">Solana (SOL)</SelectItem>
                <SelectItem value="USDTUSD">Tether (USDT)</SelectItem>
                <SelectItem value="WLDUSD">Worldcoin (WLD)</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-white/70 mt-1">
              Current price: {currentPrices[symbol] !== undefined ? 
                `$${currentPrices[symbol]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                <span className="inline-flex items-center">
                  <span className="mr-2">Loading</span>
                  <svg className="animate-spin h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              }
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition" className="text-white">Alert Condition</Label>
            <RadioGroup 
              value={condition} 
              onValueChange={(value) => setCondition(value as 'above' | 'below')}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="above" id="above" className="border-white/20 text-white" />
                <Label htmlFor="above" className="text-white">Price goes above</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="below" id="below" className="border-white/20 text-white" />
                <Label htmlFor="below" className="text-white">Price goes below</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPrice" className="text-white">Target Price (USD)</Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Enter target price"
              className="bg-background/40 border-white/20 text-white"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Alert'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PriceAlertForm;
