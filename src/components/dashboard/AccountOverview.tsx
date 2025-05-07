
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserService } from '@/lib/user-service';

import { ArrowDownRight as TrendingDown, ArrowUpRight as TrendingUp, Wallet, CreditCard } from "lucide-react"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

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
    console.log('Subscribing to balance updates for user:', uid);

    // Use UserService to subscribe to user data
    const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
      if (!userData) {
        console.error('No user data found');
        setIsLoading(false);
        return;
      }
      
      const parsedBalance = typeof userData.balance === 'string' ? parseFloat(userData.balance) : userData.balance;
      const initialBalance = userData.initialBalance || parsedBalance;
      const totalPL = userData.totalProfitLoss || 0;

      if (isNaN(parsedBalance)) {
        console.error('Invalid balance value received:', userData.balance);
        setBalance(0);
        setTotalBalance(0);
      } else {
        setBalance(parsedBalance);
        setTotalBalance(parsedBalance + (userData.assetsValue || 0));
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
    window.location.href = "/withdraw";
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
              `$${isDemoMode ? parseFloat(localStorage.getItem('demoBalance') || '10000').toFixed(2) : totalBalance.toFixed(2)}`
            )}
          </div>
          {!isDemoMode && (
            <div className="flex items-center mt-1 text-sm">
              <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
              <span className="text-green-400">+0.00%</span>
              <span className="ml-1 text-white/60">today</span>
            </div>
          )}
          {isDemoMode && (
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
