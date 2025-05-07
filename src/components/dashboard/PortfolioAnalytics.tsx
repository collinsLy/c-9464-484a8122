import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { UserService } from "@/lib/user-service";

// Time range options
const timeRanges = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '1y', value: '1y' },
  { label: 'All', value: 'all' },
];

export function PortfolioAnalytics() {
  // Add CSS transition class to smooth out any layout changes
  const transitionClass = "transition-all duration-300 ease-in-out";
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [userAssets, setUserAssets] = useState<Record<string, any>>({});
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
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

  // Define base assets
  const baseAssets = [
    { symbol: "BTC", name: "Bitcoin", fullName: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum", fullName: "Ethereum" },
    { symbol: "USDT", name: "Tether", fullName: "TetherUS" },
    { symbol: "USDC", name: "USD Coin", fullName: "USD Coin" },
    { symbol: "BNB", name: "Binance Coin", fullName: "Binance Coin" },
    { symbol: "DOGE", name: "Dogecoin", fullName: "Dogecoin" },
    { symbol: "SOL", name: "Solana", fullName: "Solana" },
    { symbol: "XRP", name: "Ripple", fullName: "Ripple" },
    { symbol: "WLD", name: "Worldcoin", fullName: "Worldcoin" },
    { symbol: "ADA", name: "Cardano", fullName: "Cardano" },
    { symbol: "DOT", name: "Polkadot", fullName: "Polkadot" },
    { symbol: "LINK", name: "Chainlink", fullName: "Chainlink" },
    { symbol: "MATIC", name: "Polygon", fullName: "Polygon" }
  ];

  // Define colors for common assets
  const assetColors: Record<string, string> = {
    'BTC': '#F7931A',
    'ETH': '#627EEA',
    'SOL': '#00FFA3',
    'WLD': '#4B5563',
    'BNB': '#F3BA2F',
    'ADA': '#0033AD',
    'DOGE': '#C3A634',
    'XRP': '#23292F',
    'DOT': '#E6007A',
    'LINK': '#2A5ADA',
    'MATIC': '#8247E5',
    'USDT': '#26A17B',
    'USDC': '#2775CA',
    'OTHER': '#9CA3AF'
  };

  // Fetch current prices for all assets
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Get symbols from baseAssets array
        const symbols = baseAssets
          .map(asset => asset.symbol)
          .filter(symbol => symbol !== 'USDT'); // Filter out USDT as we handle it separately

        const symbolsQuery = symbols.map(s => `${s}USDT`);
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
        const data = await response.json();

        const prices: Record<string, number> = {};
        data.forEach((item: any) => {
          const symbol = item.symbol.replace('USDT', '');
          prices[symbol] = parseFloat(item.price);
        });
        // Add USDT itself with value of 1
        prices['USDT'] = 1;
        setAssetPrices(prices);

        // Use setTimeout to debounce frequent updates and prevent UI flicker
        setTimeout(() => {
          // Calculate portfolio value when prices update
          calculatePortfolioValue(userAssets, prices);
          setIsLoading(false);
        }, 300);
      } catch (error) {
        console.error('Error fetching asset prices:', error);
      }
    };

    fetchPrices();
    // Update prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [userAssets]);

  // Calculate total portfolio value and update allocation data
  const calculatePortfolioValue = (assets: Record<string, any>, prices: Record<string, number>) => {
    if (!assets) return;

    // Get USDT balance (may be in user.balance or assets.USDT)
    let usdtBalance = assets.USDT?.amount || 0;

    // Start with USDT balance
    let total = usdtBalance;

    const allocation: { name: string; symbol: string; value: number; percent: number; color: string }[] = [];

    // Add value of all other assets
    Object.entries(assets).forEach(([symbol, data]: [string, any]) => {
      if (symbol === 'USDT') {
        // Already counted USDT in usdtBalance
        allocation.push({
          name: 'Tether',
          symbol: 'USDT',
          value: usdtBalance,
          percent: 0, // Will calculate after all assets
          color: assetColors['USDT']
        });
        return;
      }

      const amount = data.amount || 0;
      if (amount <= 0) return; // Skip zero balances

      const price = prices[symbol] || 0;
      const valueInUsdt = amount * price;

      console.log(`Asset ${symbol}: Amount ${amount} × Price ${price} = ${valueInUsdt} USDT`);

      total += valueInUsdt;

      // Find full name from baseAssets or use symbol
      const assetInfo = baseAssets.find(a => a.symbol === symbol);
      const assetName = assetInfo?.fullName || symbol;

      allocation.push({
        name: assetName,
        symbol,
        value: valueInUsdt,
        percent: 0, // Will calculate after totaling
        color: assetColors[symbol] || assetColors['OTHER']
      });
    });

    // Calculate percentages now that we have the total
    allocation.forEach(asset => {
      asset.percent = total > 0 ? Math.round((asset.value / total) * 100) : 0;
    });

    // Sort by value (highest first)
    allocation.sort((a, b) => b.value - a.value);

    console.log(`Total portfolio value: ${total} USDT`);
    setTotalPortfolioValue(total);

    // Update portfolio data with new allocation
    updatePortfolioData(total, allocation);
  };

  // Update portfolio data state with performance metrics
  const updatePortfolioData = (total: number, allocation: { name: string; symbol: string; value: number; percent: number; color: string }[]) => {
    const dayChange = total * 0.05; // Placeholder - should come from real data
    const weekChange = total * 0.1; // Placeholder
    const monthChange = total * 0.15; // Placeholder
    const yearChange = total * 0.3; // Placeholder
    const totalPL = total * 0.4; // Placeholder

    setPortfolioData({
      current: total,
      change: dayChange,
      changePercent: total > 0 ? (dayChange / total) * 100 : 0,
      isPositive: dayChange >= 0,
      allocation,
      performance: {
        '24h': {
          value: dayChange,
          percent: total > 0 ? (dayChange / total) * 100 : 0,
          isPositive: dayChange >= 0
        },
        '7d': {
          value: weekChange,
          percent: total > 0 ? (weekChange / total) * 100 : 0,
          isPositive: weekChange >= 0
        },
        '30d': {
          value: monthChange,
          percent: total > 0 ? (monthChange / total) * 100 : 0,
          isPositive: monthChange >= 0
        },
        '1y': {
          value: yearChange,
          percent: total > 0 ? (yearChange / total) * 100 : 0,
          isPositive: yearChange >= 0
        },
        'all': {
          value: totalPL,
          percent: total > 0 ? (totalPL / total) * 100 : 0,
          isPositive: totalPL >= 0
        }
      }
    });
  };

  // Fetch user data and assets
  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Subscribe to user data changes
    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      if (!userData) {
        console.error('No user data found');
        setIsLoading(false);
        return;
      }

      // Parse balance values for USDT from main balance field
      const parsedBalance = typeof userData.balance === 'number' ? userData.balance : 
                          (typeof userData.balance === 'string' ? parseFloat(userData.balance) : 0);

      // Create assets object with all assets including USDT
      const assets: Record<string, any> = { ...(userData.assets || {}) };

      // Add or update USDT from main balance if not already in assets
      if (!assets.USDT || !assets.USDT.amount) {
        assets.USDT = {
          amount: parsedBalance,
          name: 'USDT',
          symbol: 'USDT'
        };
      }

      console.log('User assets:', assets);
      setUserAssets(assets);

      // Calculate portfolio value with latest asset data and prices
      calculatePortfolioValue(assets, assetPrices);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [assetPrices]);

  const renderPerformanceCard = (timeframe: string) => {
    const data = portfolioData.performance[timeframe as keyof typeof portfolioData.performance];

    return (
      <Card className={`bg-background/40 backdrop-blur-lg border-white/10 ${transitionClass}`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">{timeframe} Performance</h3>
            <div className="h-5 w-5 flex items-center justify-center">
              {isLoading ? (
                <div className="w-5 h-5 bg-white/10 animate-pulse rounded-full"></div>
              ) : (
                data.isPositive ? 
                  <TrendingUp className="w-5 h-5 text-green-500" /> : 
                  <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
          <div className="h-8 mb-2 flex items-center">
            {isLoading ? (
              <div className="w-24 h-8 bg-white/10 animate-pulse rounded"></div>
            ) : (
              <div className="text-3xl font-bold text-white">${Math.abs(data.value).toFixed(2)}</div>
            )}
          </div>
          <div className="h-4 flex items-center">
            {isLoading ? (
              <div className="w-16 h-4 bg-white/10 animate-pulse rounded"></div>
            ) : (
              <div className={`flex items-center ${data.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {data.isPositive ? 
                  <ArrowUpRight className="w-4 h-4 mr-1" /> : 
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                }
                <span>{data.isPositive ? '+' : '-'}{Math.abs(data.percent).toFixed(2)}%</span>
              </div>
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
              <div className="min-h-[100px]">
                <p className="text-white/70">Total Portfolio Value</p>
                <div className="h-10 my-2">
                  {isLoading ? (
                    <div className="w-36 h-10 bg-white/10 animate-pulse rounded"></div>
                  ) : (
                    <h2 className="text-3xl font-bold">${portfolioData.current.toFixed(2)}</h2>
                  )}
                </div>
                <div className="h-5">
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
              </div>
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Asset Allocation</h3>
              <div className="min-h-[160px]">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between h-8">
                        <div className="w-24 h-5 bg-white/10 animate-pulse rounded"></div>
                        <div className="w-28 h-5 bg-white/10 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {portfolioData.allocation.length > 0 ? (
                      portfolioData.allocation.map((asset) => (
                        <div key={asset.symbol} className="flex items-center justify-between h-8">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }}></div>
                            <span>{asset.name} ({asset.symbol})</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-white/70">{asset.percent}%</span>
                            <span>${asset.value.toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/50 text-center pt-4">No assets found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`flex items-center justify-center h-56 ${transitionClass}`}>
              {isLoading ? (
                <div className="w-36 h-36 bg-white/10 animate-pulse rounded-full"></div>
              ) : (
                <div className={`w-36 h-36 rounded-full border-8 border-accent/30 flex items-center justify-center relative ${transitionClass}`}>
                  {portfolioData.allocation.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PieChart className="w-12 h-12 text-white/70" />
                      <p className="text-xs text-white/70 mt-16">No assets</p>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full" style={{ 
                          background: generateConicGradient(portfolioData.allocation)
                        }} className="rounded-full">
                        </div>
                      </div>
                      <PieChart className="w-12 h-12 text-white/70 z-10" />
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderPerformanceCard(timeRange)}
              <Card className={`bg-background/40 backdrop-blur-lg border-white/10 ${transitionClass}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Total Assets</h3>
                    <PieChart className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="h-8 mb-2 flex items-center">
                    {isLoading ? (
                      <div className="w-8 h-8 bg-white/10 animate-pulse rounded"></div>
                    ) : (
                      <div className="text-3xl font-bold text-white">{portfolioData.allocation.length}</div>
                    )}
                  </div>
                  <div className="h-5 text-white/70">
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

  allocation.forEach((asset, index) => {
    const startPercent = currentPercent;
    currentPercent += asset.percent;

    gradientString += `${asset.color} ${startPercent}% ${currentPercent}%`;

    if (index < allocation.length - 1) {
      gradientString += ', ';
    }
  });

  gradientString += ')';
  return gradientString;
}