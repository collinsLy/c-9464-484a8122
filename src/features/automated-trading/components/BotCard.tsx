
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play } from "lucide-react";
import { BotTier } from "../types";

interface BotCardProps {
  bot: BotTier;
  onTradeClick: (bot: BotTier) => void;
}

export function BotCard({ bot, onTradeClick }: BotCardProps) {
  const BotIcon = bot.icon;
  
  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <BotIcon className={`h-8 w-8 ${bot.iconColor}`} />
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
          onClick={() => onTradeClick(bot)}
        >
          <Play className="mr-2 h-4 w-4" />
          Trade
        </Button>
      </CardFooter>
    </Card>
  );
}
