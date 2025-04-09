import { useState } from "react";
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
  SearchIcon, PlusCircle, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, Filter, SlidersHorizontal 
} from "lucide-react";

const BotsPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [activeTab, setActiveTab] = useState("marketplace");
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Trading Bots</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                        const handleTradeClick = async () => {
                          if (bot.id === "standard" && demoBalance < 20) {
                            toast.error("Insufficient Funds", {
                              description: "You need a minimum balance of $20 to use the Standard bot.",
                            });
                            return;
                          }

                          toast.success(`${bot.type} Bot Activated`, {
                            description: `Your ${bot.type} bot is now trading ${bot.pair} with demo funds.`,
                          });

                          await new Promise(resolve => setTimeout(resolve, 2000));

                          const isWin = Math.random() < 0.7;
                          const amount = bot.price;
                          const profitMultiplier = isWin ? 1.8 : -1.0;
                          const profitLoss = amount * profitMultiplier;

                          const currentBalance = parseFloat(localStorage.getItem('demoBalance') || '10000');
                          const newBalance = currentBalance + profitLoss;
                          localStorage.setItem('demoBalance', newBalance.toString());

                          if (isWin) {
                            toast.success(`Trade Won!`, {
                              description: `Profit: $${profitLoss.toFixed(2)}. New Balance: $${newBalance.toFixed(2)}`,
                            });
                          } else {
                            toast.error(`Trade Lost`, {
                              description: `Loss: $${Math.abs(profitLoss).toFixed(2)}. New Balance: $${newBalance.toFixed(2)}`,
                            });
                          }

                          window.dispatchEvent(new Event('storage'));
                        };

                        return (
                          <BotCard
                            key={bot.id}
                            bot={bot}
                            onTradeClick={handleTradeClick}
                            isDemoMode={isDemoMode}
                            userBalance={parseFloat(localStorage.getItem('demoBalance') || '10000')}
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