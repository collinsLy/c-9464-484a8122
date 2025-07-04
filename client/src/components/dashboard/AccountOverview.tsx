import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { usePreloadData } from '../../contexts/PreloadContext';

const AccountOverview = () => {
  const [user] = useAuthState(auth);
  const [showBalance, setShowBalance] = useState(true);
  const { 
    isLoading, 
    userAssets, 
    portfolioTotal, 
    balance, 
    refreshData, 
    lastUpdated 
  } = usePreloadData();

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(num);
  };

  // Calculate 24h change (mock data for now)
  const dailyChange = 2.5;
  const dailyChangeAmount = portfolioTotal * (dailyChange / 100);
  const isPositive = dailyChange > 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-8 bg-gray-700 rounded w-2/3"></div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-8 bg-gray-700 rounded w-2/3"></div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-8 bg-gray-700 rounded w-2/3"></div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
              Total Portfolio Value
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="h-6 w-6 p-0"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {showBalance ? formatCurrency(portfolioTotal) : '••••••'}
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
              <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}{dailyChange.toFixed(2)}%
              </Badge>
              <span className="text-sm text-muted-foreground">
                {isPositive ? '+' : ''}{formatCurrency(dailyChangeAmount)} (24h)
              </span>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
          <CardDescription>Your current account balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Assets</CardTitle>
          <CardDescription>Value of all assets in your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(Object.keys(userAssets || {}).length)}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountOverview;