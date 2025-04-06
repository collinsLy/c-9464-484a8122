
import { useState } from "react";
import { toast } from "sonner";
import { botTiers } from "@/features/automated-trading/data/bots";
import { BotCard } from "@/features/automated-trading/components/BotCard";
import { BotStatistics } from "@/features/automated-trading/components/BotStatistics";
import { StrategyLibrary } from "@/features/automated-trading/components/StrategyLibrary";
import { OverviewCard } from "@/features/automated-trading/components/OverviewCard";
import { BotTier } from "@/features/automated-trading/types";

interface AutomatedTradingProps {
  isDemoMode?: boolean;
}

const AutomatedTrading = ({ isDemoMode = false }: AutomatedTradingProps) => {
  const [userBalance] = useState(isDemoMode ? 10000 : 0);

  const handleTradeClick = (bot: BotTier) => {
    if (isDemoMode) {
      toast.success(`Demo Bot Activated`, {
        description: `${bot.type} bot is now running with virtual funds. No real money is being used.`,
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
    
    if (userBalance < requiredBalance) {
      toast.error("Insufficient Funds", {
        description: `You need a minimum balance of $${requiredBalance} to activate the ${bot.type} bot.`,
      });
      return;
    }
    
    toast.success(`Bot Activated`, {
      description: `${bot.type} bot has been successfully activated with real funds.`,
    });
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
