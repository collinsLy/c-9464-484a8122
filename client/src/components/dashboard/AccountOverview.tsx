import { ArrowUp, ArrowDown } from "lucide-react"; 
import { Card, CardContent } from "@/components/ui/card";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { UserService } from "@/lib/user-service";

interface AccountOverviewProps {
  isDemoMode?: boolean;
}

const AccountOverview = ({ isDemoMode = false }: AccountOverviewProps) => {
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [profitLoss, setProfitLoss] = useState(0);
  const [profitLossPercent, setProfitLossPercent] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [dailyChange, setDailyChange] = useState(0.00);
  const [previousDayBalance, setPreviousDayBalance] = useState(0);
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [userAssets, setUserAssets] = useState<Record<string, any>>({});

  // Calculate total portfolio value with current prices
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

    setTotalBalance(total);
  };

  // Fetch current prices for assets with increased debounce and memoization
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const FETCH_INTERVAL = 3000; // 3 seconds
    const CHANGE_THRESHOLD = 0.001; // 0.1%

    const fetchPrices = async () => {
      try {
        const symbols = Object.keys(userAssets)
          .filter(symbol => symbol !== 'USDT');

        if (symbols.length === 0) {
          calculatePortfolioValue(userAssets, {}, balance);
          return;
        }

        const symbolsQuery = symbols.map(s => `${s}USDT`);
        const controller = new AbortController();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => {
            controller.abort();
            reject(new Error('Timeout'));
          }, 2000)
        );

        const fetchPromise = fetch(
          `https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`,
          { signal: controller.signal }
        );

        const response = await Promise.race([fetchPromise, timeoutPromise]);
        const data = await (response as Response).json();

        const newPrices: Record<string, number> = {};
        data.forEach((item: any) => {
          const symbol = item.symbol.replace('USDT', '');
          newPrices[symbol] = parseFloat(item.price);
        });
        newPrices['USDT'] = 1;

        // Deep compare prices to prevent unnecessary updates
        const hasSignificantChanges = Object.entries(newPrices).some(
          ([key, value]) => {
            const oldPrice = assetPrices[key];
            return !oldPrice || Math.abs((value - oldPrice) / oldPrice) > CHANGE_THRESHOLD;
          }
        );

        if (hasSignificantChanges) {
          setAssetPrices(prev => {
            // Smooth transition between old and new prices
            const smoothedPrices: Record<string, number> = {};
            Object.entries(newPrices).forEach(([key, value]) => {
              const oldPrice = prev[key];
              smoothedPrices[key] = oldPrice 
                ? oldPrice + (value - oldPrice) * 0.3 // Gradual transition
                : value;
            });
            return smoothedPrices;
          });

          // Only calculate portfolio value if prices changed significantly
          calculatePortfolioValue(userAssets, newPrices, balance);
        }
      } catch (error) {
        console.error('Error fetching asset prices:', error);
      }
    };

    if (Object.keys(userAssets).length > 0) {
      const debounceTimer = setTimeout(fetchPrices, 3000); // Increased to 3 seconds
      return () => clearTimeout(debounceTimer);
    }
  }, [userAssets, balance]);

  useEffect(() => {
    if (isDemoMode) {
      // Load demo balance from localStorage
      const demoBalance = parseFloat(localStorage.getItem('demoBalance') || '10000');
      setBalance(demoBalance);
      setTotalBalance(demoBalance);
      setProfitLoss(0);
      setProfitLossPercent(0);
      setIsLoading(false);
      return;
    }

    const uid = localStorage.getItem('userId');

    if (!uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Subscribe to user data updates
    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      if (!userData) {
        console.error('No user data found');
        setIsLoading(false);
        return;
      }

      // Parse balance values
      const parsedBalance = typeof userData.balance === 'number' ? userData.balance : 
                          (typeof userData.balance === 'string' ? parseFloat(userData.balance) : 0);

      const initialBalance = userData.initialBalance || parsedBalance;
      const totalPL = userData.totalProfitLoss || 0;
      const prevBalance = userData.previousDayBalance || 0;
      setPreviousDayBalance(prevBalance);

      // Calculate daily change percentage
      const dailyChangeValue = prevBalance > 0 
        ? ((parsedBalance - prevBalance) / prevBalance) * 100 
        : 0;
      setDailyChange(dailyChangeValue);

      if (isNaN(parsedBalance)) {
        console.error('Invalid balance value received:', userData.balance);
        setBalance(0);
        setTotalBalance(0);
      } else {
        setBalance(parsedBalance);
        setProfitLoss(totalPL);
        setProfitLossPercent(initialBalance > 0 ? (totalPL / initialBalance) * 100 : 0);

        // Store user assets for portfolio calculation
        setUserAssets(userData.assets || {});

        // Calculate portfolio value including all assets
        calculatePortfolioValue(userData.assets || {}, assetPrices, parsedBalance);
      }

      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isDemoMode, assetPrices]);

  const handleDeposit = () => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Deposits are not available in demo mode. Switch to live account to deposit funds.",
        variant: "destructive",
      });
      return;
    }
    window.location.href = "/deposit";
  };

  const handleWithdraw = () => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Withdrawals are not available in demo mode. Switch to live account to withdraw funds.",
        variant: "destructive",
      });
      return;
    }
    window.location.href = "/withdraw";
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Account Summary</h2>
      {/* Improved mobile layout - 2 columns on small screens, 3 on medium+ */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white rounded-2xl shadow-lg">
          <CardContent className="p-4">
            <div className="text-sm md:text-lg text-[#7a7a7a]">Total Balance</div>
            <div className="text-xl md:text-2xl font-bold flex items-center">
              {isLoading ? (
                <span className="text-white/60">Loading...</span>
              ) : (
                <div className="relative">
                  <span className={`transition-opacity duration-200 ${Object.keys(assetPrices).length === 0 ? 'opacity-50' : 'opacity-100'}`}>
                    ${totalBalance.toFixed(2)}
                  </span>
                  {Object.keys(assetPrices).length === 0 && (
                    <span className="absolute top-0 left-0 ml-1 animate-pulse text-white/60">*</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center text-xs md:text-sm">
              {dailyChange >= 0 ? (
                <>
                  <ArrowUp className="w-3 h-3 md:w-4 md:h-4 mr-1 text-green-500" />
                  <span className="text-green-500">+{dailyChange.toFixed(2)}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3 h-3 md:w-4 md:h-4 mr-1 text-red-500" />
                  <span className="text-red-500">{dailyChange.toFixed(2)}%</span>
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
              {isLoading ? (
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
            <div className={`text-xl md:text-2xl font-bold flex items-center ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {isLoading ? (
                <span className="text-white/60">Loading...</span>
              ) : (
                `${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)}`
              )}
            </div>
            <div className="flex items-center text-xs md:text-sm">
              {profitLossPercent >= 0 ? (
                <>
                  <ArrowUp className="w-3 h-3 md:w-4 md:h-4 mr-1 text-green-500" />
                  <span className="text-green-500">+{profitLossPercent.toFixed(2)}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3 h-3 md:w-4 md:h-4 mr-1 text-red-500" />
                  <span className="text-red-500">{profitLossPercent.toFixed(2)}%</span>
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