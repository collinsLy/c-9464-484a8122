
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BotTier } from "../types";

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
    if (isDemoMode) {
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
    } else {
      const requiredBalance = getMinBalance(bot.id);
      
      if (userBalance < requiredBalance) {
        toast.error("Insufficient Balance", {
          description: `You need a minimum balance of $${requiredBalance} to use the ${bot.type} bot. Current balance: $${userBalance}`,
        });
        return;
      }

      try {
        // Verify balance one more time before execution
        const uid = localStorage.getItem('userId');
        if (!uid) {
          toast.error("Authentication Error", {
            description: "Please log in to continue trading.",
          });
          return;
        }

        const currentBalance = await UserBalanceService.getUserBalance(uid);
        if (currentBalance < requiredBalance) {
          toast.error("Insufficient Balance", {
            description: `You need a minimum balance of $${requiredBalance} to use the ${bot.type} bot.`,
          });
          return;
        }

        toast.success(`${bot.type} Bot Activated`, {
          description: `Your ${bot.type} bot is now trading ${bot.pair} with real funds.`,
        });
        
        onTradeClick(bot);
      } catch (error) {
        console.error('Error verifying balance:', error);
        toast.error("Trading Error", {
          description: "Unable to verify balance. Please try again.",
        });
      }
    }
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={bot.icon} className="mr-2 h-6 w-6" alt={`${bot.type} icon`} />
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
