import React from 'react';
import { usePreloadData, usePreloadedBalance, usePreloadedPrices } from '@/hooks/usePreloadData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, User, DollarSign } from 'lucide-react';

export const PreloadDemo: React.FC = () => {
  const { userProfile, isLoading, lastUpdated, refreshData, isStale } = usePreloadData();
  const { balance, refreshBalance } = usePreloadedBalance();
  const { prices, getPrice } = usePreloadedPrices(['BTCUSDT', 'ETHUSDT', 'BNBUSDT']);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Preload Demo</h2>
        <div className="flex items-center space-x-2">
          <Badge variant={isStale ? "destructive" : "secondary"}>
            {isStale ? "Stale" : "Fresh"}
          </Badge>
          <Button
            onClick={refreshData}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* User Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Loading...' : 'Preloaded balance'}
            </p>
            <Button 
              onClick={refreshBalance} 
              size="sm" 
              variant="ghost" 
              className="mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Balance
            </Button>
          </CardContent>
        </Card>

        {/* User Profile Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userProfile?.username || 'Anonymous'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Loading...' : 'Preloaded profile'}
            </p>
            <div className="mt-2 space-y-1">
              <div className="text-sm">
                Email: {userProfile?.email || 'Not set'}
              </div>
              <div className="text-sm">
                Status: {userProfile?.status || 'Active'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cached Prices Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cached Prices</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(prices).map(([symbol, price]) => (
                <div key={symbol} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{symbol}</span>
                  <span className="text-sm">${price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isLoading ? 'Loading...' : 'Cached for 30s'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <strong>Last Updated:</strong> {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
          </div>
          <div className="text-sm">
            <strong>Loading State:</strong> {isLoading ? 'Yes' : 'No'}
          </div>
          <div className="text-sm">
            <strong>Data Status:</strong> {isStale ? 'Stale (>30s)' : 'Fresh (<30s)'}
          </div>
          <div className="text-sm">
            <strong>BTC Price:</strong> ${getPrice('BTCUSDT').toFixed(2)}
          </div>
          <div className="text-sm">
            <strong>ETH Price:</strong> ${getPrice('ETHUSDT').toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};