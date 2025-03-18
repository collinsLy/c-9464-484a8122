import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

interface TradingPanelProps {
  symbol: string;
  isDemoMode?: boolean;
}

const TradingPanel: React.FC<TradingPanelProps> = ({ symbol, isDemoMode = false }) => {
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState<number>(0);
  const { toast } = useToast();

  const handleTrade = async (type: 'buy' | 'sell') => {
    try {
      // Mock trade execution
      toast({
        title: "Trade Executed",
        description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amount} ${symbol}`,
      });
    } catch (error) {
      toast({
        title: "Trade Failed",
        description: "Failed to execute trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{isDemoMode ? "Demo Trade" : "Trade"} {symbol}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy">
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button 
                className="w-full" 
                onClick={() => handleTrade('buy')}
              >
                Buy {symbol}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="sell">
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button 
                className="w-full"
                onClick={() => handleTrade('sell')}
              >
                Sell {symbol}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TradingPanel;