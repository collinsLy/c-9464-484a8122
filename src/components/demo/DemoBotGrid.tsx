
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Award, Play, Bot, Info } from "lucide-react";
import { toast } from "sonner";

// Define the Bot type
interface Bot {
  id: string;
  type: string;
  price: number;
  description: string;
  duration: string;
  pair: string;
  marketType: string;
  profit: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

const DemoBotGrid = () => {
  const [demoBalance] = useState(10000);
  
  // Bot tiers data
  const bots: Bot[] = [
    { 
      id: "standard", 
      type: "Standard", 
      price: 20, 
      description: "Basic trading bot with automated Rise & Fall predictions", 
      duration: "2 seconds", 
      pair: "SOL/USD", 
      marketType: "Rise & Fall", 
      profit: "100%",
      icon: Shield,
      iconColor: "text-blue-400"
    },
    { 
      id: "master", 
      type: "Master", 
      price: 40, 
      description: "Advanced bot with Even/Odd market predictions for Bitcoin", 
      duration: "2 seconds", 
      pair: "BTC/USD", 
      marketType: "Even/Odd", 
      profit: "80%",
      icon: Sparkles,
      iconColor: "text-purple-400"
    },
    { 
      id: "pro-basic", 
      type: "Pro (Basic)", 
      price: 100, 
      description: "Professional bot with advanced algorithms for BNB", 
      duration: "N/A", 
      pair: "BNB/USD", 
      marketType: "Even/Odd", 
      profit: "100%",
      icon: Award,
      iconColor: "text-yellow-400"
    },
    { 
      id: "pro-premium", 
      type: "Pro (Premium)", 
      price: 200, 
      description: "Premium bot with highest success rate and profit potential", 
      duration: "1 second", 
      pair: "ETH/USD", 
      marketType: "Even/Odd", 
      profit: "200%",
      icon: Award,
      iconColor: "text-pink-400"
    },
  ];

  const handleTradeClick = (bot: Bot) => {
    // Check if user has sufficient balance for the Standard bot
    if (bot.id === "standard" && demoBalance < 20) {
      toast.error("Insufficient Funds", {
        description: "You need a minimum balance of $20 to use the Standard bot.",
      });
      return;
    }
    
    toast.success(`${bot.type} Bot Activated`, {
      description: `Your ${bot.type} bot is now trading ${bot.pair} with demo funds.`,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {bots.map((bot) => (
        <Card key={bot.id} className="bg-background/40 backdrop-blur-lg border-white/10 text-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-2">
              <bot.icon className={`h-8 w-8 ${bot.iconColor}`} />
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
