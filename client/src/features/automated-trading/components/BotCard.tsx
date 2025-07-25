import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Info, DollarSign } from "lucide-react";
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
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isUsingCustomAmount, setIsUsingCustomAmount] = useState(false);

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
  const tradeAmount = isUsingCustomAmount && customAmount ? parseFloat(customAmount) : minBalance;
  const hasRequiredBalance = isDemoMode || userBalance >= (isUsingCustomAmount ? tradeAmount : minBalance);
  const hasValidCustomAmount = !isUsingCustomAmount || (customAmount && !isNaN(tradeAmount) && tradeAmount >= minBalance);

  const handleClick = async () => {
    try {
      // Validate custom amount if being used
      if (isUsingCustomAmount) {
        if (!customAmount || isNaN(tradeAmount) || tradeAmount < minBalance) {
          toast.error("Invalid Trading Amount", {
            description: `Please enter a valid amount. Minimum required: $${minBalance}`,
          });
          return;
        }
      }

      if (isDemoMode) {
        // Demo trading logic
        if (userBalance < tradeAmount) {
          toast.error("Insufficient Demo Balance", {
            description: `You need a minimum balance of $${tradeAmount} to use demo trading.`,
          });
          return;
        }

        // Deduct trade amount immediately
        const currentDemoBalance = parseFloat(localStorage.getItem('demoBalance') || '10000');
        if (currentDemoBalance < tradeAmount) {
          toast.error("Insufficient Demo Balance", {
            description: `Current demo balance: $${currentDemoBalance.toFixed(2)}. Required: $${tradeAmount}`,
          });
          return;
        }

        const newDemoBalance = currentDemoBalance - tradeAmount;
        localStorage.setItem('demoBalance', newDemoBalance.toString());

        toast.success(`${bot.type} Bot Activated`, {
          description: `Your ${bot.type} bot is now trading ${bot.pair} with demo funds.`,
        });

        // Simulate trade execution
        await new Promise(resolve => setTimeout(resolve, 2000));

        const today = new Date().toDateString();
        const dailyTradeKey = `demoTradeCount_${today}`;
        const tradeCount = parseInt(localStorage.getItem(dailyTradeKey) || '0');
        const isWin = tradeCount < 7 ? true : Math.random() < 0.7;
        localStorage.setItem(dailyTradeKey, (tradeCount + 1).toString());

        if (isWin) {
          const profit = tradeAmount * 0.8;
          const finalBalance = newDemoBalance + tradeAmount + profit;
          localStorage.setItem('demoBalance', finalBalance.toString());
          
          toast.success(`Trade Won!`, {
            description: `Profit: $${profit.toFixed(2)}. New Balance: $${finalBalance.toFixed(2)}`,
          });
        } else {
          toast.error(`Trade Lost`, {
            description: `Loss: $${tradeAmount.toFixed(2)}. New Balance: $${newDemoBalance.toFixed(2)}`,
          });
        }

        window.dispatchEvent(new Event('storage'));
        return;
      }

      // Live trading logic
      const uid = localStorage.getItem('userId');
      if (!uid) {
        toast.error("Authentication Required", {
          description: "Please log in to trade with bots.",
        });
        return;
      }

      try {
        // Get current USDT balance
        const currentBalance = await UserBalanceService.getUSDTBalance(uid);
        console.log('Current USDT balance:', currentBalance, 'Required:', tradeAmount);

        if (currentBalance < tradeAmount) {
          toast.error("Insufficient USDT Balance", {
            description: `You need ${tradeAmount} USDT to use the ${bot.type} bot. Current balance: ${currentBalance.toFixed(2)} USDT`,
          });
          return;
        }

        // Deduct trade amount immediately
        const balanceAfterTrade = currentBalance - tradeAmount;
        await UserBalanceService.updateUSDTBalance(uid, balanceAfterTrade);

        toast.success(`${bot.type} Bot Activated`, {
          description: `Trading ${tradeAmount} USDT on ${bot.pair} pair.`,
        });

        // Simulate trade execution
        await new Promise(resolve => setTimeout(resolve, 2000));

        const today = new Date().toDateString();
        const dailyTradeKey = `liveTradeCount_${uid}_${today}`;
        const tradeCount = parseInt(localStorage.getItem(dailyTradeKey) || '0');
        const isWin = tradeCount < 7 ? true : Math.random() < 0.7;
        localStorage.setItem(dailyTradeKey, (tradeCount + 1).toString());

        if (isWin) {
          const profit = tradeAmount * 0.8;
          const finalBalance = balanceAfterTrade + tradeAmount + profit;
          
          await UserBalanceService.updateUSDTBalance(uid, finalBalance);
          await UserBalanceService.updateTradeStats(uid, true, tradeAmount, profit);
          
          toast.success(`Trade Won!`, {
            description: `Profit: ${profit.toFixed(2)} USDT. New Balance: ${finalBalance.toFixed(2)} USDT`,
          });
        } else {
          await UserBalanceService.updateTradeStats(uid, false, tradeAmount, 0);
          
          toast.error(`Trade Lost`, {
            description: `Loss: ${tradeAmount.toFixed(2)} USDT. Balance: ${balanceAfterTrade.toFixed(2)} USDT`,
          });
        }

      } catch (error) {
        console.error('Error during live trade:', error);
        
        // Try to refund the trade amount if there was an error
        try {
          const currentBalance = await UserBalanceService.getUSDTBalance(uid);
          await UserBalanceService.updateUSDTBalance(uid, currentBalance + tradeAmount);
        } catch (refundError) {
          console.error('Error refunding trade amount:', refundError);
        }

        toast.error("Trading Error", {
          description: "Trade failed. Amount has been refunded to your account.",
        });
      }
    } catch (error) {
      console.error('Error in handleClick:', error);
      toast.error("System Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white overflow-hidden">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center">
            <img 
              src={bot.icon} 
              className="mr-2 h-5 w-5 sm:h-6 sm:w-6" 
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
        <CardDescription className="text-white/70 text-xs sm:text-sm mt-1">
          {bot.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm mb-4">
          <div className="text-white/70">Minimum Balance:</div>
          <div className="text-right">${minBalance}</div>

          <div className="text-white/70">Trading Pair:</div>
          <div className="text-right">{bot.pair}</div>

          <div className="text-white/70">Market Type:</div>
          <div className="text-right">{bot.marketType}</div>

          <div className="text-white/70">Duration:</div>
          <div className="text-right">{bot.duration}</div>
        </div>

        {/* Custom Amount Input Section */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor={`custom-amount-${bot.id}`} className="text-xs sm:text-sm text-white/70">
              Custom Trading Amount
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-white/70 hover:text-white"
              onClick={() => {
                setIsUsingCustomAmount(!isUsingCustomAmount);
                if (isUsingCustomAmount) {
                  setCustomAmount("");
                }
              }}
            >
              {isUsingCustomAmount ? "Use Default" : "Customize"}
            </Button>
          </div>
          
          {isUsingCustomAmount && (
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                id={`custom-amount-${bot.id}`}
                type="number"
                placeholder={`Min: ${minBalance}`}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-white/40 text-sm"
                min={minBalance}
                step="1"
              />
              {customAmount && !isNaN(tradeAmount) && tradeAmount >= minBalance && (
                <div className="text-xs text-green-400 mt-1">
                  Trading with ${tradeAmount}
                </div>
              )}
              {customAmount && (isNaN(tradeAmount) || tradeAmount < minBalance) && (
                <div className="text-xs text-red-400 mt-1">
                  Minimum amount: ${minBalance}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-6">
        <Button 
          className="w-full text-xs sm:text-sm"
          onClick={handleClick}
          disabled={!hasRequiredBalance || !hasValidCustomAmount}
          variant={hasRequiredBalance && hasValidCustomAmount ? "default" : "secondary"}
        >
          <Play className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          {!hasValidCustomAmount 
            ? `Invalid Amount (Min: $${minBalance})`
            : !hasRequiredBalance 
              ? (tradeAmount - userBalance > 9999 ? 'Deposit more to Trade' : `Deposit $${(tradeAmount - userBalance).toFixed(0)} more`)
              : `Trade${isUsingCustomAmount ? ` ($${tradeAmount})` : ''}`
          }
        </Button>
      </CardFooter>
    </Card>
  );
}