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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/*This line was changed*/}
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
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

export const TradingPanel = () => {
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState("1");
  const [orderType, setOrderType] = useState("market");
  const [selectedTab, setSelectedTab] = useState("spot");

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white h-full">
      <CardHeader>
        <CardTitle>Trading Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spot" onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="spot">Spot</TabsTrigger>
            <TabsTrigger value="futures">Futures</TabsTrigger>
            <TabsTrigger value="margin">Margin</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {selectedTab !== "spot" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Leverage
                </label>
                <div className="flex">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-white/10 text-white"
                    onClick={() => setLeverage(prev => Math.max(1, parseInt(prev) - 1).toString())}
                  >
                    -
                  </Button>
                  <Input
                    value={leverage}
                    onChange={(e) => setLeverage(e.target.value)}
                    className="h-9 mx-2 bg-white/5 border-white/10 text-white text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-white/10 text-white"
                    onClick={() => setLeverage(prev => Math.min(100, parseInt(prev) + 1).toString())}
                  >
                    +
                  </Button>
                </div>
                <div className="text-xs text-white/50 mt-1">
                  Maximum leverage: 100x
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Order Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={orderType === "market" ? "default" : "outline"}
                  size="sm"
                  className={`h-9 ${
                    orderType === "market"
                      ? "bg-accent text-black"
                      : "border-white/10 text-white"
                  }`}
                  onClick={() => setOrderType("market")}
                >
                  Market
                </Button>
                <Button
                  variant={orderType === "limit" ? "default" : "outline"}
                  size="sm"
                  className={`h-9 ${
                    orderType === "limit"
                      ? "bg-accent text-black"
                      : "border-white/10 text-white"
                  }`}
                  onClick={() => setOrderType("limit")}
                >
                  Limit
                </Button>
                <Button
                  variant={orderType === "stop" ? "default" : "outline"}
                  size="sm"
                  className={`h-9 ${
                    orderType === "stop"
                      ? "bg-accent text-black"
                      : "border-white/10 text-white"
                  }`}
                  onClick={() => setOrderType("stop")}
                >
                  Stop
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Amount (USD)
              </label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-9 bg-white/5 border-white/10 text-white"
                placeholder="Enter amount"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Buy / Long
              </Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                <ArrowDownRight className="w-4 h-4 mr-2" />
                Sell / Short
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-between items-center text-sm text-white/70 mb-2">
                <span>Available Balance</span>
                <span>$10,000.00</span>
              </div>
              <div className="flex justify-between items-center text-sm text-white/70 mb-2">
                <span>Current Price</span>
                <div className="flex items-center">
                  <span className="text-green-400 mr-1">$45,678.90</span>
                  <RefreshCw className="w-3 h-3 text-white/50" />
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-white/70">
                <span>Estimated Fee</span>
                <span>$0.25</span>
              </div>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TradingPanel;
