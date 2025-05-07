import { ArrowUp, ArrowDown } from "lucide-react"; 
import { Card, CardContent } from "@/components/ui/card";
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
  const [dailyChange, setDailyChange] = useState(0.00); // Added for daily performance
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

  // Fetch current prices for assets
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Get symbols from assets to fetch prices
        const symbols = Object.keys(userAssets)
          .filter(symbol => symbol !== 'USDT'); // Filter out USDT as we handle it separately

        if (symbols.length === 0) return;

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

        // Recalculate portfolio value when prices update
        calculatePortfolioValue(userAssets, prices, balance);
      } catch (error) {
        console.error('Error fetching asset prices:', error);
      }
    };

    if (Object.keys(userAssets).length > 0) {
      const debounceTimer = setTimeout(fetchPrices, 1000);
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

      // Get daily change (if available, otherwise default to 0)
      const dailyChangeValue = userData.dailyChange || 0;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white rounded-2xl shadow-lg">
          <CardContent className="pt-6 pb-5">
            <div className="text-lg text-[#7a7a7a] mb-1">Total Balance</div>
            <div className="text-2xl font-bold h-8 flex items-center">
              {isLoading ? (
                <span className="text-white/60">Loading...</span>
              ) : (
                `$${totalBalance.toFixed(2)}`
              )}
            </div>
            <div className="flex items-center mt-1 text-sm h-5">
              {dailyChange >= 0 ? (
                <>
                  <ArrowUp className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-green-500">+{dailyChange.toFixed(2)}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4 mr-1 text-red-500" />
                  <span className="text-red-500">{dailyChange.toFixed(2)}%</span>
                </>
              )}
              <span className="ml-1 text-[#7a7a7a]">today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white rounded-2xl shadow-lg">
          <CardContent className="pt-6 pb-5">
            <div className="text-lg text-[#7a7a7a] mb-1">Available Cash</div>
            <div className="text-2xl font-bold h-8 flex items-center">
              {isLoading ? (
                <span className="text-white/60">Loading...</span>
              ) : (
                `$${balance.toFixed(2)}`
              )}
            </div>
            <div className="flex mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2 text-white border-white/10 hover:bg-white/10 rounded-md"
                onClick={handleDeposit}
              >
                Deposit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-white border-white/10 hover:bg-white/10 rounded-md"
                onClick={handleWithdraw}
              >
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white rounded-2xl shadow-lg">
          <CardContent className="pt-6 pb-5">
            <div className="text-lg text-[#7a7a7a] mb-1">Profit / Loss</div>
            <div className={`text-2xl font-bold h-8 flex items-center ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {isLoading ? (
                <span className="text-white/60">Loading...</span>
              ) : (
                `${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)}`
              )}
            </div>
            <div className="flex items-center mt-1 text-sm h-5">
              {profitLossPercent >= 0 ? (
                <>
                  <ArrowUp className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-green-500">+{profitLossPercent.toFixed(2)}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4 mr-1 text-red-500" />
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