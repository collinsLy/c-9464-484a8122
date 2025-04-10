
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const CryptoConverter = () => {
  const [mode, setMode] = useState('instant');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-white">Convert USDT to BTC</CardTitle>
        <p className="text-sm text-white/70">Instant Price | Guaranteed Price | Any Pair</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="instant" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="instant" className="flex-1">Instant</TabsTrigger>
            <TabsTrigger value="recurring" className="flex-1">Recurring</TabsTrigger>
            <TabsTrigger value="limit" className="flex-1">Limit</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-white/70">From</span>
                <span className="text-sm text-white/70">Available Balance: 0.00781662 USDT</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.01 - 4,700,000"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="bg-background/40 border-white/10 text-white"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-white font-medium">USDT</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="ghost" className="text-white">
                ↑↓
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-white/70">To</span>
                <span className="text-sm text-white/70">Available Balance: 0 BTC</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00000013 - 58"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  className="bg-background/40 border-white/10 text-white"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-white font-medium">BTC</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-[#f0b90b] hover:bg-[#f0b90b]/90 text-black">
              Enter an amount
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
