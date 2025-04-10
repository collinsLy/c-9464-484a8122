import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserService } from '@/lib/firebase-service'; // Added UserService import

import { ArrowDownRight as TrendingDown, ArrowUpRight as TrendingUp, RefreshCw, Wallet, CreditCard } from "lucide-react"; //Corrected import for TrendingDown and TrendingUp
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { UserBalanceService } from "@/lib/firebase-service";


interface AccountOverviewProps {
  isDemoMode?: boolean;
}

const AccountOverview = ({ isDemoMode = false }: AccountOverviewProps) => {
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [profitLoss, setProfitLoss] = useState(0);
  const [profitLossPercent, setProfitLossPercent] = useState(0);

  useEffect(() => {
    const uid = localStorage.getItem('userId');

    if (!uid || isDemoMode) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('Subscribing to balance updates for user:', uid);

    // Use UserBalanceService to subscribe to balance updates
    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      const parsedBalance = typeof userData.balance === 'string' ? parseFloat(userData.balance) : userData.balance;
      const initialBalance = userData.initialBalance || parsedBalance;
      const totalPL = userData.totalProfitLoss || 0;

      if (isNaN(parsedBalance)) {
        console.error('Invalid balance value received:', userData.balance);
        setBalance(0);
      } else {
        setBalance(parsedBalance);
        setProfitLoss(totalPL);
        setProfitLossPercent((totalPL / initialBalance) * 100);
      }
      setIsLoading(false);
    });

    return () => {
      console.log('Unsubscribing from balance updates');
      unsubscribe();
    };
  }, [isDemoMode]);

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
    toast({
      title: "Withdrawal Initiated",
      description: "Please follow the verification steps to complete your withdrawal.",
    });
  };

  const handleTestBalanceUpdate = async () => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Balance updates are not available in demo mode.",
        variant: "destructive",
      });
      return;
    }

    const uid = localStorage.getItem('userId');
    if (!uid) {
      toast({
        title: "Error",
        description: "User ID not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      // Update balance with a random value between 100 and 1000
      const newBalance = Math.floor(Math.random() * 900) + 100;
      await UserBalanceService.updateUserBalance(uid, newBalance);
      console.log('Test balance updated to:', newBalance);
      toast({
        title: "Success",
        description: `Balance updated to $${newBalance.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error updating test balance:', error);
      toast({
        title: "Error",
        description: "Failed to update balance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-white/70">
            {isDemoMode ? "Demo Balance" : "Total Balance"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {isLoading ? (
              <span className="text-white/60">Loading...</span>
            ) : (
              `$${isDemoMode ? parseFloat(localStorage.getItem('demoBalance') || '10000').toFixed(2) : balance.toFixed(2)}`
            )}
          </div>
          {!isDemoMode ? (
            <div className="flex items-center mt-1 text-sm">
              {profitLoss >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1 text-red-400" />
              )}
              <span className={profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                {profitLoss >= 0 ? '+' : '-'}{Math.abs(profitLossPercent).toFixed(2)}%
              </span>
              <span className="ml-1 text-white/60">today</span>
            </div>
          ) : (
            <div className="text-xs text-white/60 mt-1">Virtual funds for practice</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-white/70">
            {isDemoMode ? "Demo Cash" : "Available Cash"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {isLoading ? (
              <span className="text-white/60">Loading...</span>
            ) : (
              `$${isDemoMode ? parseFloat(localStorage.getItem('demoBalance') || '10000').toFixed(2) : balance.toFixed(2)}`
            )}
          </div>
          <div className="flex mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2 text-white border-white/20 hover:bg-white/10"
              onClick={handleDeposit}
            >
              <Wallet className="w-4 h-4 mr-1" />
              Deposit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-white/20 hover:bg-white/10"
              onClick={handleWithdraw}
            >
              <CreditCard className="w-4 h-4 mr-1" />
              Withdraw
            </Button>
            {isDemoMode && (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2 text-white border-white/20 hover:bg-white/10"
                onClick={() => {
                  toast({
                    title: "Demo Reset",
                    description: "Your demo balance has been reset to $10,000",
                  });
                  window.location.reload();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reset Demo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-white/70">
            {isDemoMode ? "Demo P/L" : "Profit / Loss"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {isDemoMode ? "+$0.00" : `${profitLoss >= 0 ? '+' : '-'}$${Math.abs(profitLoss).toFixed(2)}`}
          </div>
          <div className="flex items-center mt-1 text-sm">
            {profitLoss >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1 text-red-400" />
            )}
            <span className={profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
              {profitLoss >= 0 ? '+' : '-'}{Math.abs(profitLossPercent).toFixed(2)}%
            </span>
            <span className="ml-1 text-white/60">all time</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountOverview;