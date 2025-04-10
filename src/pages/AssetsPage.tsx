
import { useState, useEffect } from "react";
import { UserService } from "@/lib/firebase-service";
import { getCoinData } from "@/lib/api/coingecko";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import React, { useEffect, useState } from 'react';
import { PriceService } from '@/lib/price-service';

const AssetsPage = () => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [profitLoss, setProfitLoss] = useState(0);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      if (userData) {
        const parsedBalance = typeof userData.balance === 'string' ? parseFloat(userData.balance) : userData.balance;
        setBalance(parsedBalance || 0);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [prices, setPrices] = useState({});
  
  const baseAssets = [
    {
      name: "BTC",
      symbol: "BTC",
      fullName: "Bitcoin",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "USDT",
      symbol: "USDT",
      fullName: "TetherUS",
      balance: balance,
      amount: balance.toFixed(8)
    },
    {
      name: "BNB",
      symbol: "BNB",
      fullName: "Binance Coin",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "WLD",
      symbol: "WLD",
      fullName: "Worldcoin",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "USDC",
      symbol: "USDC",
      fullName: "USD Coin",
      balance: 0,
      amount: "0.00000000"
    },
    {
      name: "SOL",
      symbol: "SOL",
      fullName: "Solana",
      balance: 0,
      amount: "0.00000000"
    }
  ];

  useEffect(() => {
    // Subscribe to cached prices
    const unsubscribe = PriceService.subscribeToPrices((newPrices) => {
      setPrices(newPrices);
    });

    return () => unsubscribe();
  }, []);

  const assets = baseAssets.map(asset => ({
    ...asset,
    price: prices[asset.symbol] || 0
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Estimated Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{balance.toFixed(8)} USDT</div>
              <div className="text-sm text-white/60">≈ ${balance.toFixed(2)}</div>
              <div className="flex items-center gap-2 text-sm">
                <span>Today's PnL</span>
                <span className={`${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ({(profitLoss / balance * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>My Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="coin-view">
              <TabsList className="bg-background/40">
                <TabsTrigger value="coin-view">Coin View</TabsTrigger>
                <TabsTrigger value="account-view">Account View</TabsTrigger>
              </TabsList>
              <TabsContent value="coin-view" className="pt-4">
                <div className="rounded-lg border border-white/10">
                  <div className="grid grid-cols-3 p-3 text-sm font-medium text-white/60">
                    <div>Coin</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Price/Cost</div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {assets.map((asset, index) => (
                      <div key={index} className="grid grid-cols-3 p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${asset.symbol.toLowerCase()}.svg`}
                            alt={asset.symbol}
                            className="w-6 h-6"
                            onError={(e) => {
                              e.currentTarget.src = "https://assets.coingecko.com/coins/images/31069/small/worldcoin.jpeg";
                            }}
                          />
                          <div>
                            <div>{asset.symbol}</div>
                            <div className="text-sm text-white/60">{asset.fullName}</div>
                          </div>
                        </div>
                        <div className="text-right">{asset.amount}</div>
                        <div className="text-right">
                          ${asset.symbol === 'USDT' ? '1.00' : prices[asset.symbol]?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AssetsPage;
