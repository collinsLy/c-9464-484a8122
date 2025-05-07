
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { UserService } from "@/lib/user-service";
import { db } from '@/lib/firebase';

// Time range options
const timeRanges = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '1y', value: '1y' },
  { label: 'All', value: 'all' },
];

export function PortfolioAnalytics() {
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState({
    current: 0,
    change: 0,
    changePercent: 0,
    isPositive: true,
    allocation: [] as { name: string; symbol: string; value: number; percent: number; color: string }[],
    performance: {
      '24h': { value: 0, percent: 0, isPositive: true },
      '7d': { value: 0, percent: 0, isPositive: true },
      '30d': { value: 0, percent: 0, isPositive: true },
      '1y': { value: 0, percent: 0, isPositive: true },
      'all': { value: 0, percent: 0, isPositive: true }
    }
  });

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Base assets list with standard properties and colors
    const baseAssets = [
      { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
      { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
      { symbol: 'USDT', name: 'Tether', color: '#26A17B' },
      { symbol: 'SOL', name: 'Solana', color: '#00FFA3' },
      { symbol: 'DOGE', name: 'Dogecoin', color: '#C3A634' },
      { symbol: 'XRP', name: 'Ripple', color: '#23292F' },
      { symbol: 'ADA', name: 'Cardano', color: '#0033AD' },
      { symbol: 'BNB', name: 'Binance Coin', color: '#F3BA2F' },
      { symbol: 'MATIC', name: 'Polygon', color: '#8247E5' },
      { symbol: 'DOT', name: 'Polkadot', color: '#E6007A' },
      { symbol: 'LINK', name: 'Chainlink', color: '#2A5ADA' },
      { symbol: 'WLD', name: 'Worldcoin', color: '#4B5563' },
      { symbol: 'USDC', name: 'USD Coin', color: '#2775CA' },
      { symbol: 'OTHER', name: 'Other', color: '#9CA3AF' }
    ];

    // Map colors by symbol for easy lookup
    const assetColors: Record<string, string> = {};
    baseAssets.forEach(asset => {
      assetColors[asset.symbol] = asset.color;
    });

    // Subscribe to user data changes
    const unsubscribe = UserService.subscribeToUserData(uid, async (userData) => {
      if (!userData) {
        console.error('No user data found');
        setIsLoading(false);
        return;
      }

      try {
        // Parse USDT balance (cash)
        const parsedBalance = typeof userData.balance === 'number' ? userData.balance : 
                            (typeof userData.balance === 'string' ? parseFloat(userData.balance) : 0);
        
        // Get all assets from user data
        const userAssets = userData.assets || {};
        
        // Fetch current prices for all assets
        const assetPrices: Record<string, number> = {};
        
        // Get symbols from user assets and base assets to ensure we have all prices
        const symbols = Array.from(
          new Set([
            ...Object.keys(userAssets), 
            ...baseAssets.map(asset => asset.symbol)
          ])
        ).filter(symbol => symbol !== 'USDT'); // USDT has a fixed price of 1
        
        // Add USDT with price 1
        assetPrices['USDT'] = 1;
        
        // Try to get prices from API
        try {
          const symbolsQuery = symbols.map(s => `${s}USDT`);
          const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
          if (response.ok) {
            const data = await response.json();
            
            data.forEach((item: any) => {
              const symbol = item.symbol.replace('USDT', '');
              assetPrices[symbol] = parseFloat(item.price);
            });
          }
        } catch (error) {
          console.error('Error fetching asset prices:', error);
          // If fetch fails, try to use prices stored in user assets data
          Object.entries(userAssets).forEach(([symbol, data]: [string, any]) => {
            if (data.price && !assetPrices[symbol]) {
              assetPrices[symbol] = data.price;
            }
          });
        }
        
        // Calculate total portfolio value and build allocation data
        let totalPortfolioValue = parsedBalance; // Start with cash balance
        const allocation: { name: string; symbol: string; value: number; percent: number; color: string }[] = [];
        
        // Process each asset with balance > 0
        Object.entries(userAssets).forEach(([symbol, data]: [string, any]) => {
          if (symbol === 'USDT') return; // Skip USDT as it's handled separately
          
          const amount = data.amount || 0;
          if (amount <= 0) return; // Skip assets with zero balance
          
          const price = assetPrices[symbol] || data.price || 0;
          const value = amount * price;
          
          // Skip negligible values
          if (value < 0.01) return;
          
          totalPortfolioValue += value;
          
          // Find asset info from base assets
          const baseAsset = baseAssets.find(a => a.symbol === symbol);
          
          allocation.push({
            name: baseAsset?.name || data.name || symbol,
            symbol,
            value,
            percent: 0, // Will calculate after totaling
            color: assetColors[symbol] || assetColors['OTHER']
          });
        });
        
        // Add USDT balance if > 0
        if (parsedBalance > 0) {
          allocation.push({
            name: 'Cash (USDT)',
            symbol: 'USDT',
            value: parsedBalance,
            percent: 0, // Will calculate after totaling
            color: assetColors['USDT']
          });
        }
        
        // Calculate percentages
        allocation.forEach(asset => {
          asset.percent = totalPortfolioValue > 0 
            ? Math.round((asset.value / totalPortfolioValue) * 100) 
            : 0;
        });
        
        // Sort by value (descending)
        allocation.sort((a, b) => b.value - a.value);
        
        // Get or calculate profit/loss data
        const totalPL = userData.totalProfitLoss || 0;
        const dayChange = userData.dayChange || (totalPL * 0.2); // Fallback if no day data
        const weekChange = userData.weekChange || (totalPL * 0.6); // Fallback
        const monthChange = userData.monthChange || (totalPL * 0.8); // Fallback
        const yearChange = userData.yearChange || (totalPL * 0.9); // Fallback
        
        // Prepare performance data for different time periods
        const performance = {
          '24h': {
            value: dayChange,
            percent: totalPortfolioValue > 0 ? (dayChange / totalPortfolioValue) * 100 : 0,
            isPositive: dayChange >= 0
          },
          '7d': {
            value: weekChange,
            percent: totalPortfolioValue > 0 ? (weekChange / totalPortfolioValue) * 100 : 0,
            isPositive: weekChange >= 0
          },
          '30d': {
            value: monthChange,
            percent: totalPortfolioValue > 0 ? (monthChange / totalPortfolioValue) * 100 : 0,
            isPositive: monthChange >= 0
          },
          '1y': {
            value: yearChange,
            percent: totalPortfolioValue > 0 ? (yearChange / totalPortfolioValue) * 100 : 0,
            isPositive: yearChange >= 0
          },
          'all': {
            value: totalPL,
            percent: totalPortfolioValue > 0 ? (totalPL / totalPortfolioValue) * 100 : 0,
            isPositive: totalPL >= 0
          }
        };
        
        // Update state with new data
        setPortfolioData({
          current: totalPortfolioValue,
          change: dayChange,
          changePercent: totalPortfolioValue > 0 ? (dayChange / totalPortfolioValue) * 100 : 0,
          isPositive: dayChange >= 0,
          allocation,
          performance
        });
      } catch (error) {
        console.error('Error processing portfolio data:', error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const renderPerformanceCard = (timeframe: string) => {
    const data = portfolioData.performance[timeframe as keyof typeof portfolioData.performance];
    
    return (
      <Card className="bg-background/40 backdrop-blur-lg border-white/10">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">{timeframe} Performance</h3>
            {isLoading ? (
              <div className="w-5 h-5 bg-white/10 animate-pulse rounded-full"></div>
            ) : (
              data.isPositive ? 
                <TrendingUp className="w-5 h-5 text-green-500" /> : 
                <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="text-3xl font-bold mb-2 text-white">
            {isLoading ? (
              <div className="w-24 h-8 bg-white/10 animate-pulse rounded"></div>
            ) : (
              `$${Math.abs(data.value).toFixed(2)}`
            )}
          </div>
          <div className={`flex items-center ${data.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isLoading ? (
              <div className="w-16 h-4 bg-white/10 animate-pulse rounded"></div>
            ) : (
              <>
                {data.isPositive ? 
                  <ArrowUpRight className="w-4 h-4 mr-1" /> : 
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                }
                <span>{data.isPositive ? '+' : '-'}{Math.abs(data.percent).toFixed(2)}%</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <CardTitle>Portfolio Analytics</CardTitle>
        <div className="flex justify-start">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="bg-background/40 border-white/10 text-white">
              {timeRanges.map((range) => (
                <TabsTrigger 
                  key={range.value}
                  value={range.value}
                  className={`text-white ${timeRange === range.value ? 'bg-accent' : ''}`}
                >
                  {range.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/70">Total Portfolio Value</p>
                {isLoading ? (
                  <div className="w-36 h-10 bg-white/10 animate-pulse rounded my-2"></div>
                ) : (
                  <h2 className="text-3xl font-bold">${portfolioData.current.toFixed(2)}</h2>
                )}
                {isLoading ? (
                  <div className="w-28 h-5 bg-white/10 animate-pulse rounded"></div>
                ) : (
                  <div className={`flex items-center ${portfolioData.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {portfolioData.isPositive ? 
                      <ArrowUpRight className="w-4 h-4 mr-1" /> : 
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    }
                    <span>
                      {portfolioData.isPositive ? '+' : '-'}
                      ${Math.abs(portfolioData.change).toFixed(2)} 
                      ({Math.abs(portfolioData.changePercent).toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Asset Allocation</h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="w-24 h-5 bg-white/10 animate-pulse rounded"></div>
                      <div className="w-28 h-5 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {portfolioData.allocation.map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }}></div>
                        <span>{asset.name} ({asset.symbol})</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white/70">{asset.percent}%</span>
                        <span>${asset.value.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-center h-56">
              {isLoading ? (
                <div className="w-36 h-36 bg-white/10 animate-pulse rounded-full"></div>
              ) : (
                <div className="w-36 h-36 rounded-full border-8 border-accent/30 flex items-center justify-center relative">
                  {portfolioData.allocation.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PieChart className="w-12 h-12 text-white/70" />
                      <p className="text-xs text-white/70 mt-16">No assets</p>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0">
                        <div 
                          className="w-full h-full rounded-full" 
                          style={{ 
                            background: generateConicGradient(portfolioData.allocation)
                          }}
                        ></div>
                      </div>
                      <div className="w-20 h-20 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <PieChart className="w-10 h-10 text-white/70" />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {renderPerformanceCard(timeRange)}
              <Card className="bg-background/40 backdrop-blur-lg border-white/10">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Total Assets</h3>
                    <PieChart className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="text-3xl font-bold mb-2 text-white">
                    {isLoading ? (
                      <div className="w-8 h-8 bg-white/10 animate-pulse rounded"></div>
                    ) : (
                      portfolioData.allocation.length
                    )}
                  </div>
                  <div className="text-white/70">
                    {portfolioData.allocation.length > 3 ? 'Diversified Portfolio' : 'Building Portfolio'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to generate conic gradient from allocation data
function generateConicGradient(allocation: { percent: number, color: string }[]) {
  if (allocation.length === 0) return 'none';
  
  let gradientString = 'conic-gradient(';
  let currentPercent = 0;
  
  // Only include assets with non-zero percentages
  const filteredAllocation = allocation.filter(asset => asset.percent > 0);
  
  filteredAllocation.forEach((asset, index) => {
    const startPercent = currentPercent;
    currentPercent += asset.percent;
    
    gradientString += `${asset.color} ${startPercent}% ${currentPercent}%`;
    
    if (index < filteredAllocation.length - 1) {
      gradientString += ', ';
    }
  });
  
  // If we don't have any assets with percentages, show a default gray
  if (filteredAllocation.length === 0) {
    gradientString += '#374151';
  }
  
  gradientString += ')';
  return gradientString;
}
