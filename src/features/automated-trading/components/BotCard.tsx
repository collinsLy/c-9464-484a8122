import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play } from "lucide-react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BotTier } from "../types";

interface BotCardProps {
  bot: BotTier;
  onTradeClick: (bot: BotTier) => void;
}

export function BotCard({ bot, onTradeClick }: BotCardProps) {
  const getMinBalance = (botId: string) => {
    const balances = {
      standard: 20,
      master: 40,
      'pro-basic': 100,
      'pro-premium': 200
    };
    return balances[botId as keyof typeof balances] || 0; // Handle cases where botId is not found
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <bot.icon className={`mr-2 h-6 w-6 ${bot.iconColor}`} />
            {bot.type}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-white/70" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Minimum balance required: ${getMinBalance(bot.id)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
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
          onClick={() => onTradeClick(bot)}
        >
          <Play className="mr-2 h-4 w-4" />
          Trade
        </Button>
      </CardFooter>
    </Card>
  );
}