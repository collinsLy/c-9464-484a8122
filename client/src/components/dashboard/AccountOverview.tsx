import { ArrowUp, ArrowDown } from "lucide-react"; 
import { Card, CardContent } from "@/components/ui/card";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { usePreload } from "@/contexts/PreloadContext";

interface AccountOverviewProps {
  isDemoMode?: boolean;
}

const AccountOverview = ({ isDemoMode = false }: AccountOverviewProps) => {
  const { toast } = useToast();
  const { portfolio, isLoading } = usePreload();

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
              {isLoading || !portfolio ? (
                <span className="text-white/60">Loading...</span>
              ) : (
                <span className="transition-opacity duration-300 ease-in-out">
                  ${portfolio.totalValue.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center text-xs md:text-sm">
              {!portfolio || portfolio.dailyChange >= 0 ? (
                <>
                  <ArrowUp className="w-3 h-3 md:w-4 md:h-4 mr-1 text-green-500" />
                  <span className="text-green-500">+{portfolio?.dailyChange.toFixed(2) || '0.00'}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3 h-3 md:w-4 md:h-4 mr-1 text-red-500" />
                  <span className="text-red-500">{portfolio.dailyChange.toFixed(2)}%</span>
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
              {isLoading || !portfolio ? (
                <span className="text-white/60">Loading...</span>
              ) : (
                `$${portfolio.usdtBalance.toFixed(2)}`
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
            <div className={`text-xl md:text-2xl font-bold flex items-center ${!portfolio || portfolio.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {isLoading || !portfolio ? (
                <span className="text-white/60">Loading...</span>
              ) : (
                `${portfolio.profitLoss >= 0 ? '+' : ''}$${portfolio.profitLoss.toFixed(2)}`
              )}
            </div>
            <div className="flex items-center text-xs md:text-sm">
              {!portfolio || portfolio.profitLossPercent >= 0 ? (
                <>
                  <ArrowUp className="w-3 h-3 md:w-4 md:h-4 mr-1 text-green-500" />
                  <span className="text-green-500">+{portfolio?.profitLossPercent.toFixed(2) || '0.00'}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3 h-3 md:w-4 md:h-4 mr-1 text-red-500" />
                  <span className="text-red-500">{portfolio.profitLossPercent.toFixed(2)}%</span>
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