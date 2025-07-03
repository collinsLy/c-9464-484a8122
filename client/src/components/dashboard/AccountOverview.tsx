import { ArrowUp, ArrowDown } from "lucide-react"; 
import { Card, CardContent } from "@/components/ui/card";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { usePreload } from "@/contexts/PreloadContext";
import { useState, useEffect } from "react";
import { UserService } from "@/lib/firebase-service";

interface AccountOverviewProps {
  isDemoMode?: boolean;
}

const AccountOverview = ({ isDemoMode = false }: AccountOverviewProps) => {
  const { toast } = useToast();
  const { portfolio, isLoading } = usePreload();
  
  // Add state for real-time data similar to AssetsPage
  const [balance, setBalance] = useState(0);
  const [previousDayBalance, setPreviousDayBalance] = useState(0);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [userAssets, setUserAssets] = useState<Record<string, any>>({});
  const [dataReady, setDataReady] = useState(false);
  const [pricesLoaded, setPricesLoaded] = useState(false);

  // Base assets list similar to AssetsPage
  const baseAssets = [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "USDT", name: "TetherUS" },
    { symbol: "USDC", name: "USD Coin" },
    { symbol: "BNB", name: "Binance Coin" },
    { symbol: "DOGE", name: "Dogecoin" },
    { symbol: "SOL", name: "Solana" },
    { symbol: "XRP", name: "Ripple" },
    { symbol: "WLD", name: "Worldcoin" },
    { symbol: "ADA", name: "Cardano" },
    { symbol: "DOT", name: "Polkadot" },
    { symbol: "LINK", name: "Chainlink" },
    { symbol: "MATIC", name: "Polygon" }
  ];

  // Fetch initial prices when component mounts (similar to AssetsPage)
  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialPrices = async () => {
      try {
        const symbols = baseAssets
          .map(asset => asset.symbol)
          .filter(symbol => symbol !== 'USDT');
        
        const symbolsQuery = symbols.map(s => `${s}USDT`);
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
        const data = await response.json();
        
        const prices: Record<string, number> = { USDT: 1 };
        data.forEach((item: any) => {
          const symbol = item.symbol.replace('USDT', '');
          prices[symbol] = parseFloat(item.price);
        });
        
        if (isMounted) {
          setAssetPrices(prices);
          setPricesLoaded(true);
          
          // Calculate portfolio value if we have user assets
          if (Object.keys(userAssets).length > 0) {
            calculatePortfolioValue(userAssets, prices, balance);
            setDataReady(true);
          }
        }
      } catch (error) {
        console.error('Error fetching initial prices:', error);
        if (isMounted) {
          setPricesLoaded(true);
          setDataReady(true);
        }
      }
    };

    fetchInitialPrices();

    return () => {
      isMounted = false;
    };
  }, []);

  // Periodic price updates (similar to AssetsPage)
  useEffect(() => {
    if (!pricesLoaded) return;

    const interval = setInterval(async () => {
      try {
        const symbols = baseAssets
          .map(asset => asset.symbol)
          .filter(symbol => symbol !== 'USDT');
        
        const symbolsQuery = symbols.map(s => `${s}USDT`);
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
        const data = await response.json();
        
        const prices: Record<string, number> = { USDT: 1 };
        data.forEach((item: any) => {
          const symbol = item.symbol.replace('USDT', '');
          prices[symbol] = parseFloat(item.price);
        });
        
        setAssetPrices(prices);
        calculatePortfolioValue(userAssets, prices, balance);
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [pricesLoaded, userAssets, balance]);

  // Calculate total portfolio value with current prices (similar to AssetsPage)
  const calculatePortfolioValue = (assets: Record<string, any>, prices: Record<string, number>, usdtBalance: number) => {
    // Always include USDT balance in the total
    let total = usdtBalance;
    
    // Add value of all other assets
    if (assets) {
      Object.entries(assets).forEach(([symbol, data]) => {
        if (symbol === 'USDT') return; // Skip USDT as it's already included in balance
        const amount = data.amount || 0;
        const price = prices[symbol] || 0;
        const valueInUsdt = amount * price;
        total += valueInUsdt;
      });
    }
    
    setTotalPortfolioValue(total);
  };

  // Subscribe to user data (similar to AssetsPage)
  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid || isDemoMode) {
      setDataReady(true);
      return;
    }

    // Get yesterday's date at midnight
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      // Set previous day balance from userData
      if (userData?.previousDayBalance) {
        setPreviousDayBalance(userData.previousDayBalance);
      }
      if (userData) {
        const parsedBalance = typeof userData.balance === 'string' ? parseFloat(userData.balance) : userData.balance;
        setBalance(parsedBalance || 0);
        setUserAssets(userData.assets || {});
        
        // Calculate portfolio value only if prices are loaded
        if (pricesLoaded && Object.keys(assetPrices).length > 0) {
          calculatePortfolioValue(userData.assets || {}, assetPrices, parsedBalance || 0);
          setDataReady(true);
        }
      }
    });

    return () => unsubscribe();
  }, [assetPrices, pricesLoaded, isDemoMode]);

  // Demo mode handling
  if (isDemoMode) {
    const demoBalance = parseFloat(localStorage.getItem('demoBalance') || '10000');
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Account Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white rounded-2xl shadow-lg">
            <CardContent className="p-4">
              <div className="text-sm md:text-lg text-[#7a7a7a]">Total Balance</div>
              <div className="text-xl md:text-2xl font-bold">${demoBalance.toFixed(2)}</div>
              <div className="flex items-center text-xs md:text-sm">
                <ArrowUp className="w-3 h-3 md:w-4 md:h-4 mr-1 text-green-500" />
                <span className="text-green-500">+0.00%</span>
                <span className="ml-1 text-[#7a7a7a]">today</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white rounded-2xl shadow-lg">
            <CardContent className="p-4">
              <div className="text-sm md:text-lg text-[#7a7a7a]">Available Cash</div>
              <div className="text-xl md:text-2xl font-bold">${demoBalance.toFixed(2)}</div>
              <div className="flex mt-1 space-x-1">
                <Button variant="outline" size="sm" className="text-xs md:text-sm text-white border-white/10 hover:bg-white/10 rounded-md px-2 py-1" onClick={() => toast({ title: "Demo Mode", description: "Deposits are not available in demo mode.", variant: "destructive" })}>
                  Deposit
                </Button>
                <Button variant="outline" size="sm" className="text-xs md:text-sm text-white border-white/10 hover:bg-white/10 rounded-md px-2 py-1" onClick={() => toast({ title: "Demo Mode", description: "Withdrawals are not available in demo mode.", variant: "destructive" })}>
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1 bg-background/40 backdrop-blur-lg border-white/10 text-white rounded-2xl shadow-lg">
            <CardContent className="p-4">
              <div className="text-sm md:text-lg text-[#7a7a7a]">Profit / Loss</div>
              <div className="text-xl md:text-2xl font-bold text-green-500">+$0.00</div>
              <div className="flex items-center text-xs md:text-sm">
                <ArrowUp className="w-3 h-3 md:w-4 md:h-4 mr-1 text-green-500" />
                <span className="text-green-500">+0.00%</span>
                <span className="ml-1 text-[#7a7a7a]">all time</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleDeposit = () => {
    window.location.href = "/deposit";
  };

  const handleWithdraw = () => {
    window.location.href = "/withdraw";
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Account Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white rounded-2xl shadow-lg">
          <CardContent className="p-4">
            <div className="text-sm md:text-lg text-[#7a7a7a]">Total Balance</div>
            <div className="text-xl md:text-2xl font-bold flex items-center">
              {!dataReady ? (
                <span className="text-white/60">Loading...</span>
              ) : (
                <span className="transition-opacity duration-300 ease-in-out">
                  ${totalPortfolioValue.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center text-xs md:text-sm">
              {totalPortfolioValue >= previousDayBalance ? (
                <>
                  <ArrowUp className="w-3 h-3 md:w-4 md:h-4 mr-1 text-green-500" />
                  <span className="text-green-500">
                    +{previousDayBalance > 0 ? ((totalPortfolioValue - previousDayBalance) / previousDayBalance * 100).toFixed(2) : '0.00'}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3 h-3 md:w-4 md:h-4 mr-1 text-red-500" />
                  <span className="text-red-500">
                    {previousDayBalance > 0 ? ((totalPortfolioValue - previousDayBalance) / previousDayBalance * 100).toFixed(2) : '0.00'}%
                  </span>
                </>
              )}
              <span className="ml-1 text-[#7a7a7a]">today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white rounded-2xl shadow-lg">
          <CardContent className="p-4">
            <div className="text-sm md:text-lg text-[#7a7a7a]">Available Cash</div>
            <div className="text-xl md:text-2xl font-bold flex items-center">
              {!dataReady ? (
                <span className="text-white/60">Loading...</span>
              ) : (
                `$${balance.toFixed(2)}`
              )}
            </div>
            <div className="flex mt-1 space-x-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs md:text-sm text-white border-white/10 hover:bg-white/10 rounded-md px-2 py-1"
                onClick={handleDeposit}
              >
                Deposit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs md:text-sm text-white border-white/10 hover:bg-white/10 rounded-md px-2 py-1"
                onClick={handleWithdraw}
              >
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1 bg-background/40 backdrop-blur-lg border-white/10 text-white rounded-2xl shadow-lg">
          <CardContent className="p-4">
            <div className="text-sm md:text-lg text-[#7a7a7a]">Profit / Loss</div>
            <div className={`text-xl md:text-2xl font-bold flex items-center ${(totalPortfolioValue - balance) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {!dataReady ? (
                <span className="text-white/60">Loading...</span>
              ) : (
                `${(totalPortfolioValue - balance) >= 0 ? '+' : ''}$${(totalPortfolioValue - balance).toFixed(2)}`
              )}
            </div>
            <div className="flex items-center text-xs md:text-sm">
              {(totalPortfolioValue - balance) >= 0 ? (
                <>
                  <ArrowUp className="w-3 h-3 md:w-4 md:h-4 mr-1 text-green-500" />
                  <span className="text-green-500">
                    +{balance > 0 ? (((totalPortfolioValue - balance) / balance) * 100).toFixed(2) : '0.00'}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3 h-3 md:w-4 md:h-4 mr-1 text-red-500" />
                  <span className="text-red-500">
                    {balance > 0 ? (((totalPortfolioValue - balance) / balance) * 100).toFixed(2) : '0.00'}%
                  </span>
                </>
              )}
              <span className="ml-1 text-[#7a7a7a]">all time</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountOverview;