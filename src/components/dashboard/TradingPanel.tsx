import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios'; // Import axios for API calls

interface TradingPanelProps {
  symbol: string;
  isDemoMode?: boolean;
}

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

const TradingPanel = ({ symbol, isDemoMode = false }: TradingPanelProps) => {
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [orderType, setOrderType] = useState("market");
  const [realtimePrice, setRealtimePrice] = useState(0); // State for real-time price
  const { toast } = useToast();

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(`/api/price/${symbol}`); // Replace with your API endpoint
        setRealtimePrice(response.data.price);
      } catch (error) {
        console.error("Error fetching price:", error);
        toast({
          title: "Error fetching price",
          description: "Could not retrieve real-time price.",
          variant: "destructive"
        })
        // Fallback to a default price or handle the error appropriately
        setRealtimePrice(0); 
      }
    };
    fetchPrice();
    const intervalId = setInterval(fetchPrice, 10000); // Update every 10 seconds
    return () => clearInterval(intervalId);
  }, [symbol]);


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };

  const calculateTotal = () => {
    const amountVal = parseFloat(amount) || 0;
    const priceVal = orderType === "market" ? realtimePrice : (parseFloat(price) || 0); // Use realtimePrice
    return (amountVal * priceVal).toFixed(2);
  };

  const handleBuy = () => {
    const total = calculateTotal();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to buy.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `${isDemoMode ? "Demo" : ""} Buy Order Executed`,
      description: `Successfully bought ${amount} ${symbol.substring(0, 3)} for $${total}`,
      variant: "default",
    });

    setAmount("");
    setPrice("");
  };

  const handleSell = () => {
    const total = calculateTotal();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to sell.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `${isDemoMode ? "Demo" : ""} Sell Order Executed`,
      description: `Successfully sold ${amount} ${symbol.substring(0, 3)} for $${total}`,
      variant: "default",
    });

    setAmount("");
    setPrice("");
  };

  const handleMaxAmount = () => {
    // In a real app, this would fetch the user's available balance
    // For demo purposes, we'll set a predefined amount
    if (isDemoMode) {
      const demoMaxAmount = {
        BTCUSD: "0.15",
        ETHUSD: "3.08",
        SOLUSD: "65.60",
        BNBUSD: "16.51",
        ADAUSD: "16949.15",
        DOTUSD: "1146.78",
      };

      setAmount(demoMaxAmount[symbol as keyof typeof demoMaxAmount] || "0");
    } else {
      setAmount("0");
      toast({
        title: "No Funds Available",
        description: "Please deposit funds to start trading.",
        variant: "default",
      });
    }
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{isDemoMode ? "Demo Trade" : "Trade"} {symbol}</span>
          <span className="text-lg">${realtimePrice.toLocaleString()}</span> {/* Use realtimePrice */}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="buy" className="text-green-400">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="text-red-400">Sell</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Order Type</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={orderType === "market" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOrderType("market")}
                  className={orderType === "market" 
                    ? "bg-accent text-white" 
                    : "text-white border-white/20 hover:bg-white/10"
                  }
                >
                  Market
                </Button>
                <Button
                  variant={orderType === "limit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOrderType("limit")}
                  className={orderType === "limit" 
                    ? "bg-accent text-white" 
                    : "text-white border-white/20 hover:bg-white/10"
                  }
                >
                  Limit
                </Button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Amount</span>
                <Button variant="ghost" size="sm" className="h-5 px-1 text-xs text-accent" onClick={handleMaxAmount}>
                  Max
                </Button>
              </div>
              <div className="flex">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="bg-background/40 border-white/20 text-white"
                />
                <div className="bg-background/60 border border-l-0 border-white/20 rounded-r-md px-3 flex items-center font-medium">
                  {symbol.substring(0, 3)}
                </div>
              </div>
            </div>

            {orderType === "limit" && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">Price</span>
                  <span className="text-xs text-white/60">Current: ${realtimePrice}</span> {/* Use realtimePrice */}
                </div>
                <div className="flex">
                  <Input
                    type="number"
                    placeholder={realtimePrice.toString()} {/* Use realtimePrice */}
                    value={price}
                    onChange={handlePriceChange}
                    className="bg-background/40 border-white/20 text-white"
                  />
                  <div className="bg-background/60 border border-l-0 border-white/20 rounded-r-md px-3 flex items-center font-medium">
                    USD
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Total</span>
              </div>
              <div className="flex">
                <Input
                  type="text"
                  readOnly
                  value={`$${calculateTotal()}`}
                  className="bg-background/40 border-white/20 text-white"
                />
                <div className="bg-background/60 border border-l-0 border-white/20 rounded-r-md px-3 flex items-center font-medium">
                  USD
                </div>
              </div>
            </div>

            <TabsContent value="buy" className="mt-4 p-0">
              <Button 
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                onClick={handleBuy}
              >
                Buy {symbol.substring(0, 3)}
              </Button>
            </TabsContent>

            <TabsContent value="sell" className="mt-4 p-0">
              <Button 
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                onClick={handleSell}
              >
                Sell {symbol.substring(0, 3)}
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TradingPanel;