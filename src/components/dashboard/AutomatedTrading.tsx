
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Shield, Award, Play, Info } from "lucide-react";
import { toast } from "sonner";

interface AutomatedTradingProps {
  isDemoMode?: boolean;
}

const AutomatedTrading = ({ isDemoMode = false }: AutomatedTradingProps) => {
  const [userBalance] = useState(isDemoMode ? 10000 : 0);
  
  // Bot tiers data from the requirements
  const botTiers = [
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

  const handleTradeClick = (bot: typeof botTiers[0]) => {
    // Check if user has sufficient balance for the Standard bot
    if (bot.id === "standard" && userBalance < 20) {
      toast.error("Insufficient Funds", {
        description: "You need a minimum balance of $20 to use the Standard bot.",
      });
      return;
    }
    
    if (isDemoMode) {
      toast.success(`Demo Bot Activated`, {
        description: `${bot.type} bot is now running with virtual funds. No real money is being used.`,
      });
    } else {
      if (userBalance < bot.price) {
        toast.error("Insufficient Funds", {
          description: `Please deposit at least $${bot.price} to activate this bot.`,
        });
        return;
      }
      
      toast.success(`Bot Activated`, {
        description: `${bot.type} bot has been successfully activated.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-6 w-6 text-accent" />
              {isDemoMode ? "Demo Automated Trading Bots" : "Automated Trading Bots"}
            </CardTitle>
            <CardDescription className="text-white/70">
              {isDemoMode 
                ? "Practice with our advanced algorithms using virtual funds. No real money is used."
                : "Let our advanced algorithms trade for you. Configure and deploy trading bots with our easy-to-use interface."
              }
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {botTiers.map((bot) => (
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>{isDemoMode ? "Demo Bot Statistics" : "Bot Statistics"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Total Bots Active</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Profits Generated (24h)</span>
                <span className="font-medium text-green-400">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Profits Generated (All Time)</span>
                <span className="font-medium text-green-400">$0.00</span>
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={() => toast({
                description: isDemoMode 
                  ? "Custom strategies are available in demo mode for practice."
                  : "Creating custom strategies requires a funded account.",
              })}
            >
              Create Custom Bot Strategy
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Strategy Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/70 text-sm">
              {isDemoMode 
                ? "Try our pre-built strategies with virtual funds or create your own practice strategies."
                : "Access our pre-built strategies or create your own custom trading strategies using our advanced bot configuration tools."
              }
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10"
                onClick={() => toast({
                  description: "Browse our collection of pre-built trading strategies.",
                })}
              >
                Browse Strategies
              </Button>
              <Button
                onClick={() => toast({
                  description: isDemoMode 
                    ? "Create a practice strategy with virtual funds."
                    : "Create a new trading strategy for your bots.",
                })}
              >
                Create New Strategy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutomatedTrading;
