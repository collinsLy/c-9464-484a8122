import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Calendar, Clock, Play, Pause, Plus, Edit, Trash2, Repeat, ArrowUpRight, DollarSign, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const AutoInvestPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [active, setActive] = useState(true);

  const handleCreatePlan = () => {
    if (isDemoMode) {
      toast.success("Auto-invest plan created successfully", {
        description: `${amount} USDT to buy ${selectedAsset} ${frequency}`,
      });
    } else {
      toast.error("Please enable demo mode to test this feature");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="w-full md:w-2/3">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Auto-Invest</CardTitle>
                <CardDescription className="text-white/70">Set up recurring purchases to build your portfolio with dollar-cost averaging</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="space-y-2">
                    <Label>Select Asset</Label>
                    <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                        <SelectItem value="SOL">Solana (SOL)</SelectItem>
                        <SelectItem value="MATIC">Polygon (MATIC)</SelectItem>
                        <SelectItem value="DOT">Polkadot (DOT)</SelectItem>
                        <SelectItem value="AVAX">Avalanche (AVAX)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Investment Amount (USDT)</Label>
                    <Input 
                      type="text" 
                      placeholder="0.00" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <div className="flex justify-between text-xs text-white/70">
                      <span>USDT Balance: {isDemoMode ? "1,482.35 USDT" : "0.00 USDT"}</span>
                      <Button variant="ghost" size="sm" className="h-5 p-0 text-white/70">MAX</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <RadioGroup value={frequency} onValueChange={setFrequency} className="grid grid-cols-3 gap-4">
                      <Label
                        htmlFor="daily"
                        className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${frequency === "daily" ? "border-primary" : ""}`}
                      >
                        <RadioGroupItem value="daily" id="daily" className="sr-only" />
                        <Clock className="mb-2 h-6 w-6" />
                        <span className="block text-sm font-medium">Daily</span>
                      </Label>
                      <Label
                        htmlFor="weekly"
                        className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${frequency === "weekly" ? "border-primary" : ""}`}
                      >
                        <RadioGroupItem value="weekly" id="weekly" className="sr-only" />
                        <Calendar className="mb-2 h-6 w-6" />
                        <span className="block text-sm font-medium">Weekly</span>
                      </Label>
                      <Label
                        htmlFor="monthly"
                        className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${frequency === "monthly" ? "border-primary" : ""}`}
                      >
                        <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
                        <RefreshCw className="mb-2 h-6 w-6" />
                        <span className="block text-sm font-medium">Monthly</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  {frequency === "weekly" && (
                    <div className="space-y-2">
                      <Label>Day of Week</Label>
                      <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                          <SelectItem value="0">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {frequency === "monthly" && (
                    <div className="space-y-2">
                      <Label>Day of Month</Label>
                      <Select defaultValue="1">
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          {Array.from({length: 28}, (_, i) => (
                            <SelectItem key={i+1} value={(i+1).toString()}>
                              {i+1}{i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2 text-white/70">
                    <Switch 
                      id="auto-active" 
                      checked={active}
                      onCheckedChange={setActive}
                    />
                    <Label htmlFor="auto-active">Activate plan immediately</Label>
                  </div>

                  <div className="pt-2">
                    <Button className="w-full bg-[#F2FF44] text-black hover:bg-[#E1EE33]" onClick={handleCreatePlan}>
                      Create Auto-Invest Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Dollar-Cost Averaging Calculator</CardTitle>
                <CardDescription className="text-white/70">See how regular investments can grow over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Investment Amount (USDT)</Label>
                      <Input type="text" placeholder="0.00" defaultValue="100" className="bg-white/5 border-white/10 text-white"/>
                    </div>

                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select defaultValue="weekly">
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Period</Label>
                      <Select defaultValue="1">
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          <SelectItem value="1">1 Year</SelectItem>
                          <SelectItem value="2">2 Years</SelectItem>
                          <SelectItem value="5">5 Years</SelectItem>
                          <SelectItem value="10">10 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Asset</Label>
                      <Select defaultValue="BTC">
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="SOL">Solana (SOL)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/10 hover:text-white">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Calculate
                    </Button>
                  </div>

                  <div className="border rounded-md p-6 flex flex-col justify-between text-white">
                    <div>
                      <h3 className="font-medium text-lg">Results</h3>
                      <p className="text-white/70 text-sm mb-4">Based on historical data</p>

                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-white/70">Total Invested</div>
                          <div className="text-2xl font-bold">$5,200.00</div>
                        </div>

                        <div>
                          <div className="text-sm text-white/70">Estimated Final Value</div>
                          <div className="text-2xl font-bold text-green-500">$8,754.32</div>
                        </div>

                        <div>
                          <div className="text-sm text-white/70">Potential Profit</div>
                          <div className="text-xl font-bold text-green-500">+$3,554.32 (+68.4%)</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-white/70">
                      Note: Past performance is not indicative of future results. The calculation is based on historical price data and does not account for fees or taxes.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-1/3">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>My Auto-Invest Plans</CardTitle>
              </CardHeader>
              <CardContent>
                {isDemoMode ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-medium">Bitcoin (BTC)</div>
                          <div className="text-sm text-white/70">Weekly on Mondays</div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                      </div>

                      <div className="mt-2 flex justify-between text-sm text-white/70">
                        <span>100 USDT per purchase</span>
                        <span className="text-white/70">Next: 11/20/2023</span>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1 border-white/10 hover:bg-white/10 hover:text-white">
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 border-white/10 hover:bg-white/10 hover:text-white">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-medium">Ethereum (ETH)</div>
                          <div className="text-sm text-white/70">Monthly on 1st</div>
                        </div>
                        <Badge className="bg-red-500/20 text-red-500">Paused</Badge>
                      </div>

                      <div className="mt-2 flex justify-between text-sm text-white/70">
                        <span>250 USDT per purchase</span>
                        <span className="text-white/70">Next: N/A</span>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1 border-white/10 hover:bg-white/10 hover:text-white">
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 border-white/10 hover:bg-white/10 hover:text-white">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" className="w-full border-white/10 hover:bg-white/10 hover:text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        New Plan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-white/70">
                    <div className="mb-4">You don't have any auto-invest plans yet</div>
                    <Button className="border-white/10 hover:bg-white/10 hover:text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4 bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
              </CardHeader>
              <CardContent>
                {isDemoMode ? (
                  <div className="space-y-4">
                    <div className="flex justify-between text-white">
                      <div>
                        <div className="font-medium">0.00214 BTC</div>
                        <div className="text-xs text-white/70">Weekly Auto-Buy</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">100 USDT</div>
                        <div className="text-xs text-white/70">2023-11-13</div>
                      </div>
                    </div>

                    <Separator className="border-white/10"/>

                    <div className="flex justify-between text-white">
                      <div>
                        <div className="font-medium">0.00211 BTC</div>
                        <div className="text-xs text-white/70">Weekly Auto-Buy</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">100 USDT</div>
                        <div className="text-xs text-white/70">2023-11-06</div>
                      </div>
                    </div>

                    <Separator className="border-white/10"/>

                    <div className="flex justify-between text-white">
                      <div>
                        <div className="font-medium">0.00197 BTC</div>
                        <div className="text-xs text-white/70">Weekly Auto-Buy</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">100 USDT</div>
                        <div className="text-xs text-white/70">2023-10-30</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button variant="link" size="sm" className="w-full border-white/10 hover:bg-white/10 hover:text-white">
                        View Full History
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-white/70">
                    No purchase history available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4 bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Why Auto-Invest?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-white">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Dollar-Cost Averaging</div>
                      <div className="text-white/70">Reduce the impact of volatility by spreading purchases over time</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Repeat className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Automated Discipline</div>
                      <div className="text-white/70">Stay committed to your investment strategy without emotional decisions</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Long-term Growth</div>
                      <div className="text-white/70">Build wealth steadily over time without timing the market</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AutoInvestPage;