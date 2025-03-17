
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Shield, Award } from "lucide-react";

const AutomatedTrading = () => {
  // Bot tiers data from the requirements
  const botTiers = [
    { type: "Standard", price: 20, duration: "2 seconds", pair: "SOL/USD", marketType: "Rise & Fall", profit: "100%" },
    { type: "Master", price: 40, duration: "2 seconds", pair: "BTC/USD", marketType: "Even/Odd", profit: "80%" },
    { type: "Pro (Basic)", price: 100, duration: "N/A", pair: "BNB/USD", marketType: "Even/Odd", profit: "100%" },
    { type: "Pro (Premium)", price: 200, duration: "1 second", pair: "ETH/USD", marketType: "Even/Odd", profit: "200%" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-6 w-6 text-accent" />
              Automated Trading Bots
            </CardTitle>
            <CardDescription className="text-white/70">
              Let our advanced algorithms trade for you. Configure and deploy trading bots with our easy-to-use interface.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead>Bot Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Trading Pair</TableHead>
                  <TableHead>Market Type</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {botTiers.map((bot, index) => (
                  <TableRow key={index} className="border-white/10">
                    <TableCell className="font-medium flex items-center">
                      {index === 0 && <Shield className="mr-2 h-4 w-4 text-blue-400" />}
                      {index === 1 && <Sparkles className="mr-2 h-4 w-4 text-purple-400" />}
                      {index === 2 && <Award className="mr-2 h-4 w-4 text-yellow-400" />}
                      {index === 3 && <Award className="mr-2 h-4 w-4 text-pink-400" />}
                      {bot.type}
                    </TableCell>
                    <TableCell>${bot.price}</TableCell>
                    <TableCell>{bot.duration}</TableCell>
                    <TableCell>{bot.pair}</TableCell>
                    <TableCell>{bot.marketType}</TableCell>
                    <TableCell className="text-green-400">{bot.profit}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                        Activate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Bot Statistics</CardTitle>
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
            <Button className="w-full">Create Custom Bot Strategy</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Strategy Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/70 text-sm">
              Access our pre-built strategies or create your own custom 
              trading strategies using our advanced bot configuration tools.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">Browse Strategies</Button>
              <Button>Create New Strategy</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutomatedTrading;
