import { ArrowUpRight, Wallet, CreditCard, TrendingUp, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { onSnapshot, doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface AccountOverviewProps {
  isDemoMode?: boolean;
}

const AccountOverview = ({ isDemoMode = false }: AccountOverviewProps) => {
  const { toast } = useToast();
  const [balance, setBalance] = useState(0); // State to hold the balance
  const [isLoading, setIsLoading] = useState(true); // State to track loading

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    if (!uid) return;

    const unsubscribe = onSnapshot(doc(db, 'users', uid), (doc) => {
      setIsLoading(false); // Set loading to false after data is fetched
      if (doc.exists()) {
        const data = doc.data();
        const balanceValue = parseFloat(data.balance || 0);
        setBalance(isNaN(balanceValue) ? 0 : balanceValue);
      } else {
        // If document doesn't exist, create it with initial balance
        setDoc(doc(db, 'users', uid), { balance: 0 });
      }
    });

    return () => unsubscribe();
  }, []);


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
              <ArrowUpRight className="w-4 h-4 mr-1 text-green-400" />
              <span className="text-green-400">+0.00%</span>
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
                  // Reset demo balance to initial 10,000
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
          <div className="text-3xl font-bold text-green-400">
            {isDemoMode ? "+$0.00" : "+$0.00"}
          </div>
          <div className="flex items-center mt-1 text-sm">
            <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
            <span className="text-green-400">+0.00%</span>
            <span className="ml-1 text-white/60">all time</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountOverview;