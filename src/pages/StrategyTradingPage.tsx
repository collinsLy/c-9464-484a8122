import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { botTiers } from "@/features/automated-trading/data/bots";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { BotCard } from "@/features/automated-trading/components/BotCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  SearchIcon, Filter, SlidersHorizontal, Wallet
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { UserBalanceService } from "@/lib/firebase-service";
import { useState, useEffect } from "react";
import MarketChart from "@/components/dashboard/MarketChart";

const StrategyTradingPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedTab, setSelectedTab] = useState("marketplace");
  const [userBalance, setUserBalance] = useState(0);
  const [profitLossPercent, setProfitLossPercent] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (isDemoMode) {
      const initialBalance = 10000;
      const currentBalance = parseFloat(localStorage.getItem('demoBalance') || '10000');
      const percentChange = ((currentBalance - initialBalance) / initialBalance) * 100;
      setProfitLossPercent(percentChange);
    } else if (uid) {
      // Subscribe to user data for real mode
      const unsubscribe = UserBalanceService.subscribeToBalance(uid, (newBalance) => {
        setUserBalance(newBalance);
      });
      return () => unsubscribe();
    }
  }, [isDemoMode]);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;

    const unsubscribe = UserBalanceService.subscribeToBalance(uid, (newBalance) => {
      setUserBalance(newBalance);
    });

    return () => unsubscribe();
  }, []);

  const handleTradeClick = async (bot: any) => {
    const uid = localStorage.getItem('userId');

    if (isDemoMode) {
      const minBalance = bot.price;
      const demoBalance = parseFloat(localStorage.getItem('demoBalance') || '10000');

      if (demoBalance < minBalance) {
        toast.error("Insufficient Demo Balance", {
          description: `You need a minimum balance of $${minBalance} to use demo trading.`,
        });
        return;
      }

      toast.success(`${bot.type} Bot Activated`, {
        description: `Your ${bot.type} bot is now trading ${bot.pair} with demo funds.`,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const tradeCount = parseInt(localStorage.getItem('tradeCount') || '0');
      const isWin = tradeCount < 5 ? true : Math.random() < 0.7;
      const profitMultiplier = isWin ? 1.8 : -1.0;
      const profitLoss = minBalance * profitMultiplier;

      localStorage.setItem('tradeCount', (tradeCount + 1).toString());
      const currentBalance = parseFloat(localStorage.getItem('demoBalance') || '10000');
      const newBalance = currentBalance + profitLoss;
      localStorage.setItem('demoBalance', newBalance.toString());

      if (isWin) {
        toast.success(`Trade Won!`, {
          description: `Profit: $${(minBalance * 0.8).toFixed(2)}. New Balance: $${newBalance.toFixed(2)}`,
        });
      } else {
        toast.error(`Trade Lost`, {
          description: `Loss: $${minBalance.toFixed(2)}. New Balance: $${newBalance.toFixed(2)}`,
        });
      }

      window.dispatchEvent(new Event('storage'));
      return;
    }

    if (!uid) {
      toast.error("Authentication Required", {
        description: "Please log in to trade with bots.",
      });
      return;
    }

    try {
      const currentBalance = await UserBalanceService.getUserBalance(uid);
      const requiredBalance = bot.price;

      if (currentBalance < requiredBalance) {
        toast.error("Insufficient Balance", {
          description: `You need a minimum balance of $${requiredBalance} to use the ${bot.type} bot.`,
        });
        return;
      }

      // Deduct initial trade amount
      const newBalance = currentBalance - requiredBalance;
      await UserBalanceService.updateUserBalance(uid, newBalance);

      toast.success(`${bot.type} Bot Activated`, {
        description: `Your ${bot.type} bot is now trading ${bot.pair} with real funds.`,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const tradeCount = parseInt(localStorage.getItem(`liveTradeCount_${uid}`) || '0');
      const isWin = tradeCount < 5 ? true : Math.random() < 0.7;

      localStorage.setItem(`liveTradeCount_${uid}`, (tradeCount + 1).toString());

      if (isWin) {
        const profit = requiredBalance * 0.8;
        const finalBalance = newBalance + (requiredBalance * 1.8);
        await UserBalanceService.updateUserBalance(uid, finalBalance);
        await UserBalanceService.updateTradeStats(uid, true, requiredBalance, profit);
        toast.success(`Trade Won!`, {
          description: `Profit: $${profit.toFixed(2)}. New Balance: $${finalBalance.toFixed(2)}`,
        });
      } else {
        await UserBalanceService.updateTradeStats(uid, false, requiredBalance, 0);
        toast.error(`Trade Lost`, {
          description: `Loss: $${requiredBalance.toFixed(2)}. New Balance: $${newBalance.toFixed(2)}`,
        });
      }
    } catch (error) {
      console.error('Error during trade:', error);
      toast.error("Trading Error", {
        description: "An error occurred during trading. Please try again.",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <MarketChart
          selectedSymbol={selectedSymbol}
          selectedTimeframe={selectedTimeframe}
          onSymbolChange={setSelectedSymbol}
          onTimeframeChange={setSelectedTimeframe}
        />
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Strategy Trading</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-6">
                <TabsTrigger value="marketplace" className="text-white data-[state=active]:bg-accent">
                  Bot Marketplace
                </TabsTrigger>
                <TabsTrigger value="my-strategies" className="text-white data-[state=active]:bg-accent">
                  My Strategies
                </TabsTrigger>
                <TabsTrigger value="create" className="text-white data-[state=active]:bg-accent">
                  Create Strategy
                </TabsTrigger>
              </TabsList>

              <TabsContent value="marketplace">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search marketplace..."
                        className="pl-10 bg-background/40 backdrop-blur-lg border-white/10 text-white"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-background/40 backdrop-blur-lg border border-white/10 rounded-md px-4 py-2">
                        <div className="mr-4">
                          <div className="text-sm text-white/70">Available Balance</div>
                          <div className="text-lg font-bold text-white">
                            ${isDemoMode ? parseFloat(localStorage.getItem('demoBalance') || '10000').toFixed(2) : userBalance.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-white/70">P/L %</div>
                          <div className={`text-lg font-bold ${profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent?.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Sort & Filter
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-[calc(100vh-300px)] rounded-md border border-white/10 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {botTiers.map((bot) => (
                        <BotCard
                          key={bot.id}
                          bot={bot}
                          onTradeClick={handleTradeClick}
                          isDemoMode={isDemoMode}
                          userBalance={userBalance}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="my-strategies">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search strategies..."
                        className="pl-10 bg-background/40 backdrop-blur-lg border-white/10 text-white"
                      />
                    </div>
                    <Button variant="outline" className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </div>

                  <ScrollArea className="h-[calc(100vh-300px)] rounded-md border border-white/10 p-4">
                    <div className="grid gap-4">
                      <div className="text-center py-8 text-muted-foreground">
                        No active strategies found. Create your first strategy or activate a bot from the marketplace.
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="create">
                <div className="text-center py-8 text-muted-foreground">
                  Strategy creation wizard coming soon. Choose from templates or create your own custom trading strategy.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StrategyTradingPage;