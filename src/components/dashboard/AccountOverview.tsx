import { ArrowUp, ArrowDown } from "lucide-react"; 
import { Card, CardContent } from "@/components/ui/card";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { UserService } from "@/lib/user-service";
import { useBalanceStore } from "@/lib/balance-store";

interface AccountOverviewProps {
  isDemoMode?: boolean;
}

const AccountOverview = ({ isDemoMode = false }: AccountOverviewProps) => {
  const { toast } = useToast();
  const { 
    totalPortfolioValue, 
    usdtBalance, 
    isLoading: balanceLoading,
    userAssets: storeUserAssets,
    assetPrices: storeAssetPrices,
    fetchBalances
  } = useBalanceStore();
  const [profitLoss, setProfitLoss] = useState(0);
  const [profitLossPercent, setProfitLossPercent] = useState(0);
  const [dailyChange, setDailyChange] = useState(0.00);
  const [previousDayBalance, setPreviousDayBalance] = useState(0);

  // Ensure balances are fetched if not already loaded
  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (uid && !balanceLoading && totalPortfolioValue === 0) {
      fetchBalances(uid);
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setProfitLoss(0);
      setProfitLossPercent(0);
      return;
    }

    const uid = localStorage.getItem('userId');
    if (!uid) return;

    // Subscribe to user data for profit/loss and daily changes only
    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      if (!userData) return;

      const totalPL = userData.totalProfitLoss || 0;
      const prevBalance = userData.previousDayBalance || 0;
      const initialBalance = userData.initialBalance || totalPortfolioValue;
      
      setPreviousDayBalance(prevBalance);
      setProfitLoss(totalPL);
      setProfitLossPercent(initialBalance > 0 ? (totalPL / initialBalance) * 100 : 0);

      // Calculate daily change percentage
      const dailyChangeValue = prevBalance > 0 
        ? ((totalPortfolioValue - prevBalance) / prevBalance) * 100 
        : 0;
      setDailyChange(dailyChangeValue);
    });

    return () => unsubscribe();
  }, [isDemoMode, totalPortfolioValue]);

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

  const displayBalance = isDemoMode ? 10000 : totalPortfolioValue;
  const displayPreviousBalance = isDemoMode ? 9500 : previousDayBalance;
  const balanceChange = displayBalance - displayPreviousBalance;
  const balanceChangePercent = displayPreviousBalance > 0 ? (balanceChange / displayPreviousBalance) * 100 : 0;
  const availableCash = isDemoMode ? 5000 : usdtBalance;
  const isLoading = isDemoMode ? false : balanceLoading;

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
                <span>${displayBalance.toFixed(2)}</span>
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
                `$${availableCash.toFixed(2)}`
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