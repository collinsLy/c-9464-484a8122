
import { ArrowUp } from "lucide-react"; 
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
      const assetsValue = userData.assetsValue || 0;

      if (isNaN(parsedBalance)) {
        console.error('Invalid balance value received:', userData.balance);
        setBalance(0);
        setTotalBalance(0);
      } else {
        setBalance(parsedBalance);
        setTotalBalance(parsedBalance + assetsValue);
        setProfitLoss(totalPL);
        setProfitLossPercent(initialBalance > 0 ? (totalPL / initialBalance) * 100 : 0);
      }

      setIsLoading(false);
    });

    return () => {
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
      <Card className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
        <CardContent className="pt-6 pb-5">
          <div className="text-[#7a7a7a] mb-1">Total Balance</div>
          <div className="text-3xl font-bold">
            {isLoading ? (
              <span className="text-white/60">Loading...</span>
            ) : (
              `$${totalBalance.toFixed(2)}`
            )}
          </div>
          <div className="flex items-center mt-1 text-sm">
            <ArrowUp className="w-4 h-4 mr-1 text-green-500" />
            <span className="text-green-500">+0.00%</span>
            <span className="ml-1 text-[#7a7a7a]">today</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
        <CardContent className="pt-6 pb-5">
          <div className="text-[#7a7a7a] mb-1">Available Cash</div>
          <div className="text-3xl font-bold">
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
              className="mr-2 text-white border-[#2a2a2a] hover:bg-[#2a2a2a] rounded-md"
              onClick={handleDeposit}
            >
              Deposit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-[#2a2a2a] hover:bg-[#2a2a2a] rounded-md"
              onClick={handleWithdraw}
            >
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
        <CardContent className="pt-6 pb-5">
          <div className="text-[#7a7a7a] mb-1">Profit / Loss</div>
          <div className="text-3xl font-bold text-green-500">
            {isLoading ? (
              <span className="text-white/60">Loading...</span>
            ) : (
              `+$${profitLoss.toFixed(2)}`
            )}
          </div>
          <div className="flex items-center mt-1 text-sm">
            <ArrowUp className="w-4 h-4 mr-1 text-green-500" />
            <span className="text-green-500">+0.00%</span>
            <span className="ml-1 text-[#7a7a7a]">all time</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountOverview;
