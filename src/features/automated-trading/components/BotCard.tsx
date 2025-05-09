
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BotTier } from "../types";
import { UserBalanceService } from "@/lib/firebase-service";

interface BotCardProps {
  bot: BotTier;
  onTradeClick: (bot: BotTier) => void;
  isDemoMode?: boolean;
  userBalance: number;
}

export function BotCard({ bot, onTradeClick, isDemoMode, userBalance }: BotCardProps) {
  const getMinBalance = (botId: string) => {
    const balances = {
      standard: 20,
      master: 40,
      'pro-basic': 100,
      'pro-premium': 200
    };
    return balances[botId as keyof typeof balances] || 0;
  };

  const minBalance = getMinBalance(bot.id);
  const hasRequiredBalance = isDemoMode || userBalance >= minBalance;

  const handleClick = async () => {
    try {
      const uid = localStorage.getItem('userId');
      
      if (isDemoMode) {
        if (userBalance < minBalance) {
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
        const isWin = tradeCount < 7 ? true : Math.random() < 0.7;
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
        if (currentBalance < minBalance) {
          toast.error("Insufficient Balance", {
            description: `You need a minimum balance of $${minBalance} to use the ${bot.type} bot.`,
          });
          return;
        }

        // Deduct initial trade amount
        const newBalance = currentBalance - minBalance;
        await UserBalanceService.updateUserBalance(uid, newBalance);

        toast.success(`${bot.type} Bot Activated`, {
          description: `Your ${bot.type} bot is now trading ${bot.pair} with real funds.`,
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const tradeCount = parseInt(localStorage.getItem(`liveTradeCount_${uid}`) || '0');
        const isWin = tradeCount < 7 ? true : Math.random() < 0.7;
        const profitMultiplier = isWin ? 1.8 : -1.0;
        const profitLoss = minBalance * profitMultiplier;

        localStorage.setItem(`liveTradeCount_${uid}`, (tradeCount + 1).toString());
        if (isWin) {
          const profit = minBalance * 0.8;
          const finalBalance = newBalance + (minBalance * 1.8);
          await UserBalanceService.updateUserBalance(uid, finalBalance);
          await UserBalanceService.updateTradeStats(uid, true, minBalance, profit);
          toast.success(`Trade Won!`, {
            description: `Profit: $${profit.toFixed(2)}. New Balance: $${finalBalance.toFixed(2)}`,
          });
        } else {
          await UserBalanceService.updateTradeStats(uid, false, minBalance, 0);
          toast.error(`Trade Lost`, {
            description: `Loss: $${minBalance.toFixed(2)}. New Balance: $${newBalance.toFixed(2)}`,
          });
        }

      } catch (error) {
        console.error('Error during trade:', error);
        toast.error("Trading Error", {
          description: "An error occurred during trading. Please try again.",
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
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={bot.icon} 
              className="mr-2 h-6 w-6" 
              alt={`${bot.type} icon`} 
              onError={(e) => {
                console.log(`Failed to load icon: ${bot.icon}`);
                e.currentTarget.src = "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png"; // Fallback to Bitcoin logo
              }} 
            />
            {bot.type}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-white/70" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Minimum balance required: ${minBalance}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription className="text-white/70">
          {bot.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-white/70">Required Balance:</div>
          <div className="text-right">${minBalance}</div>
          
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
          onClick={handleClick}
          disabled={!hasRequiredBalance}
          variant={hasRequiredBalance ? "default" : "secondary"}
        >
          <Play className="mr-2 h-4 w-4" />
          {hasRequiredBalance ? 'Trade' : `Deposit $${minBalance - userBalance} more to Trade`}
        </Button>
      </CardFooter>
    </Card>
  );
}
