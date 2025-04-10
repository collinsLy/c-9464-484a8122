import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MarketChart from "@/components/dashboard/MarketChart";
import { botTiers } from "@/features/automated-trading/data/bots";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { BotCard } from "@/features/automated-trading/components/BotCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  SearchIcon, PlusCircle, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, Filter, SlidersHorizontal 
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { UserBalanceService } from "@/lib/firebase-service";
import { Wallet } from "@/components/ui/icons"; // Assuming this import is correct


const BotsPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedTab, setSelectedTab] = useState("marketplace");
  const [userBalance, setUserBalance] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;

    const unsubscribe = UserBalanceService.subscribeToBalance(uid, (newBalance) => {
      setUserBalance(newBalance);
    });

    return () => unsubscribe();
  }, []);

  const handleTradeClick = async (bot: any) => { // Assuming BotTier type is available
    const uid = localStorage.getItem('userId');
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

      toast.success(`${bot.type} Bot Activated`, {
        description: `Your ${bot.type} bot is now trading ${bot.pair} with real funds.`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to verify balance. Please try again.",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white w-64">
            <CardHeader className="py-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm text-white/70">Available Balance</CardTitle>
                  <div className="text-xl font-bold mt-1">
                    ${isDemoMode ? parseFloat(localStorage.getItem('demoBalance') || '10000').toFixed(2) : userBalance.toFixed(2)}
                  </div>
                </div>
                <Wallet className="h-8 w-8 text-white/50" />
              </div>
            </CardHeader>
          </Card>
        </div>

        <MarketChart
          selectedSymbol={selectedSymbol}
          selectedTimeframe={selectedTimeframe}
          onSymbolChange={setSelectedSymbol}
          onTimeframeChange={setSelectedTimeframe}
        />
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Trading Bots</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-6">
                <TabsTrigger value="marketplace" className="text-white data-[state=active]:bg-accent">
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="my-bots" className="text-white data-[state=active]:bg-accent">
                  My Bots
                </TabsTrigger>
                <TabsTrigger value="create" className="text-white data-[state=active]:bg-accent">
                  Create New
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-bots">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search bots..."
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
                      {/* Bot cards would go here */}
                      <div className="text-center py-8 text-muted-foreground">
                        No bots found. Create your first bot to get started.
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

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
                    <Button variant="outline" className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Sort & Filter
                    </Button>
                  </div>

                  <ScrollArea className="h-[calc(100vh-300px)] rounded-md border border-white/10 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {botTiers.map((bot) => {
                        return (
                          <BotCard
                            key={bot.id}
                            bot={bot}
                            onTradeClick={handleTradeClick}
                            isDemoMode={isDemoMode}
                            userBalance={userBalance}
                          />
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="create">
                <div className="text-center py-8 text-muted-foreground">
                  Bot creation wizard coming soon.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BotsPage;