import { useState, useEffect } from "react";
import { toast } from "sonner";
import { botTiers } from "@/features/automated-trading/data/bots";
import { BotCard } from "@/features/automated-trading/components/BotCard";
import { BotStatistics } from "@/features/automated-trading/components/BotStatistics";
import { StrategyLibrary } from "@/features/automated-trading/components/StrategyLibrary";
import { OverviewCard } from "@/features/automated-trading/components/OverviewCard";
import { BotTier } from "@/features/automated-trading/types";
import { UserBalanceService } from "@/lib/firebase-service";

interface AutomatedTradingProps {
  isDemoMode?: boolean;
}

const AutomatedTrading = ({ isDemoMode = false }: AutomatedTradingProps) => {
  const [userBalance, setUserBalance] = useState(isDemoMode ? 10000 : 0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const uid = localStorage.getItem('userId');

    if (!uid || isDemoMode) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = UserBalanceService.subscribeToPortfolioBalance(uid, (newBalance) => {
      const parsedBalance = typeof newBalance === 'string' ? parseFloat(newBalance) : newBalance;
      setUserBalance(isNaN(parsedBalance) ? 0 : parsedBalance);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const handleTradeClick = async (bot: BotTier) => {
    if (isDemoMode) {
      if (userBalance < 20) {
        toast({
          variant: "destructive",
          title: "Insufficient Demo Balance",
          description: `You need a minimum balance of $20 to use demo trading. Current balance: $${userBalance}`,
        });
        return;
      }

      toast.success(`Demo Bot Activated`, {
        description: `${bot.type} bot is now running with virtual funds. No real money is being used.`,
      });

      // Simulate trade execution and outcome for demo mode
      await new Promise(resolve => setTimeout(resolve, 2000));
      const tradeCount = parseInt(localStorage.getItem('autoTradeCount') || '0');
      const isWin = tradeCount < 7 ? true : Math.random() < 0.7;
      localStorage.setItem('autoTradeCount', (tradeCount + 1).toString());
      const tradeAmount = 20; // Fixed demo trade amount
      const profitMultiplier = isWin ? 1.8 : -1.0;
      const profitLoss = tradeAmount * profitMultiplier;
      const newBalance = userBalance + profitLoss;

      if (isWin) {
        toast.success(`Demo Trade Won!`, {
          description: `Profit: $${(tradeAmount * 0.8).toFixed(2)}. New Balance: $${newBalance.toFixed(2)}`,
        });
      } else {
        toast.error(`Demo Trade Lost`, {
          description: `Loss: $${tradeAmount.toFixed(2)}. New Balance: $${newBalance.toFixed(2)}`,
        });
      }
      return;
    }

    const uid = localStorage.getItem('userId');
    if (!uid) {
      toast.error("Authentication Error", {
        description: "Please log in to continue trading.",
      });
      return;
    }

    // Check minimum balance requirements for each bot
    const minimumBalanceRequired = {
      standard: 20,
      master: 40,
      'pro-basic': 100,
      'pro-premium': 200
    };

    const requiredBalance = minimumBalanceRequired[bot.id as keyof typeof minimumBalanceRequired];

    try {
      const currentBalance = await UserBalanceService.getUserBalance(uid);
      if (currentBalance < requiredBalance) {
        toast.error("Insufficient Funds", {
          description: `You need a minimum balance of $${requiredBalance} to activate the ${bot.type} bot. Please deposit funds to continue.`,
        });
        return;
      }

      // Deduct the trade amount from user's balance
      const tradeAmount = requiredBalance;
      const newBalance = currentBalance - tradeAmount;
      await UserBalanceService.updateUserBalance(uid, newBalance);

      toast.success(`Bot Activated`, {
        description: `${bot.type} bot has been successfully activated with real funds.`,
      });

      // Simulate trade execution and outcome
      await new Promise(resolve => setTimeout(resolve, 2000));
      const tradeCount = parseInt(localStorage.getItem('autoTradeCount') || '0');
      const isWin = tradeCount < 7 ? true : Math.random() < 0.7;
      localStorage.setItem('autoTradeCount', (tradeCount + 1).toString());
      const profitMultiplier = isWin ? 1.8 : -1.0;
      const profitLoss = tradeAmount * profitMultiplier;

      if (isWin) {
        // Add profit to user's balance
        const finalBalance = newBalance + (tradeAmount * 1.8);
        await UserBalanceService.updateUserBalance(uid, finalBalance);
        toast.success(`Trade Won!`, {
          description: `Profit: $${(tradeAmount * 0.8).toFixed(2)}. New Balance: $${finalBalance.toFixed(2)}`,
        });
      } else {
        toast.error(`Trade Lost`, {
          description: `Loss: $${tradeAmount.toFixed(2)}. New Balance: $${newBalance.toFixed(2)}`,
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <OverviewCard isDemoMode={isDemoMode} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BotStatistics isDemoMode={isDemoMode} />
        <StrategyLibrary isDemoMode={isDemoMode} />
      </div>
    </div>
  );
};

export default AutomatedTrading;