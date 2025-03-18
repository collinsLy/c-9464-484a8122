import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

interface TradingPanelProps {
  symbol: string;
  isDemoMode?: boolean;
}

const TradingPanel = ({ symbol, isDemoMode = false }: TradingPanelProps) => {
  const [amount, setAmount] = useState("");
  const [position, setPosition] = useState<"long" | "short">("long");
  const { toast } = useToast();

  const handleTrade = async () => {
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }

      // Here you would typically make an API call to execute the trade
      // For demo purposes, we'll just show a success message
      toast({
        title: "Trade executed",
        description: `Successfully placed ${position} order for ${amount} ${symbol}`,
      });

      setAmount("");
    } catch (error) {
      toast({
        title: "Trade failed",
        description: "Failed to execute trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{isDemoMode ? "Demo Trade" : "Trade"} {symbol}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="long" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger
              value="long"
              className="w-1/2"
              onClick={() => setPosition("long")}
            >
              Long
            </TabsTrigger>
            <TabsTrigger
              value="short"
              className="w-1/2"
              onClick={() => setPosition("short")}
            >
              Short
            </TabsTrigger>
          </TabsList>
          <TabsContent value="long">
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/40"
              />
              <Button
                onClick={handleTrade}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Open Long Position
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="short">
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/40"
              />
              <Button
                onClick={handleTrade}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                Open Short Position
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TradingPanel;