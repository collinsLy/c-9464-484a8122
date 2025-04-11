import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Info, Play } from "lucide-react";
import { toast } from "sonner";
import { botTiers } from "@/features/automated-trading/data/bots";

const DemoBotGrid = () => {
  const [demoBalance] = useState(10000);

  const handleTradeClick = async (bot: typeof botTiers[0]) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {botTiers.map((bot) => (
        <Card key={bot.id} className="bg-background/40 backdrop-blur-lg border-white/10 text-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-2">
              <img 
                src={bot.icon} 
                alt={bot.type} 
                className={`h-8 w-8`} 
                onError={(e) => {
                  console.log(`Failed to load icon: ${bot.icon}`);
                  e.currentTarget.src = "/logos/inj-logo.svg"; // Fallback to a default logo
                }} 
              />
              <div className="text-xl font-bold text-green-400">{bot.profit}</div>
            </div>
            <CardTitle className="text-xl">{bot.type}</CardTitle>
            <CardDescription className="text-white/70">
              {bot.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-white/70">Price:</div>
              <div className="text-right">${bot.price}</div>

              <div className="text-white/70">Trading Pair:</div>
              <div className="text-right">{bot.pair}</div>

              <div className="text-white/70">Market Type:</div>
              <div className="text-right">{bot.marketType}</div>

              <div className="text-white/70">Duration:</div>
              <div className="text-right">{bot.duration}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => handleTradeClick(bot)}
            >
              <Play className="mr-2 h-4 w-4" />
              Trade
            </Button>
          </CardFooter>
        </Card>
      ))}

      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-6 w-6 text-accent" />
            About Demo Bots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 mb-4">
            Trading bots use algorithms to analyze markets and execute trades automatically based on predefined parameters.
          </p>
          <div className="flex items-start space-x-2 text-sm mb-2">
            <Info className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-white/70">
              The Standard bot requires a minimum balance of $20 to activate.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoBotGrid;