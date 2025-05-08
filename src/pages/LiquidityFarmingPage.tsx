import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { ArrowRight, Percent, Clock, Calendar, TrendingUp, BarChart3, RefreshCw, Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const LiquidityFarmingPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedPair, setSelectedPair] = useState("BTC-USDT");
  const [amount, setAmount] = useState("");
  const [farmTab, setFarmTab] = useState("active");

  const handleAddLiquidity = () => {
    if (isDemoMode) {
      toast.success("Successfully added liquidity", {
        description: `Added ${amount} to ${selectedPair} pool`,
      });
    } else {
      toast.error("Please enable demo mode to test this feature");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Liquidity Farming</h1>
            <p className="text-sm text-white/70 mt-1">Provide liquidity and earn rewards</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Add Liquidity</CardTitle>
                <CardDescription className="text-white/70">Provide liquidity to earn trading fees and farming rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white/70">Select Pool</Label>
                  <Select value={selectedPair} onValueChange={setSelectedPair}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select pool" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="BTC-USDT">BTC-USDT</SelectItem>
                      <SelectItem value="ETH-USDT">ETH-USDT</SelectItem>
                      <SelectItem value="BTC-ETH">BTC-ETH</SelectItem>
                      <SelectItem value="SOL-USDT">SOL-USDT</SelectItem>
                      <SelectItem value="MATIC-USDT">MATIC-USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                          <span className="text-xs font-bold">BTC</span>
                        </div>
                        <span>Bitcoin</span>
                      </div>
                      <Badge variant="outline" className="text-white/70 border-white/10">Balance: {isDemoMode ? "0.1482" : "0.00"}</Badge>
                    </div>
                    <Input
                      type="text"
                      placeholder="0.00"
                      className="bg-transparent border-white/10 text-white mt-2"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="flex justify-end mt-1">
                      <Button variant="ghost" size="sm" className="text-xs text-white/70 hover:text-white hover:bg-white/10">MAX</Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-xs font-bold">USDT</span>
                        </div>
                        <span>Tether</span>
                      </div>
                      <Badge variant="outline" className="text-white/70 border-white/10">Balance: {isDemoMode ? "3,421.55" : "0.00"}</Badge>
                    </div>
                    <Input
                      type="text"
                      placeholder="0.00"
                      className="bg-transparent border-white/10 text-white mt-2"
                      value={amount ? (parseFloat(amount) * 50234.25).toFixed(2) : ""}
                      readOnly
                    />
                    <div className="flex justify-end mt-1">
                      <Button variant="ghost" size="sm" className="text-xs text-white/70 hover:text-white hover:bg-white/10">MAX</Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                  <h3 className="font-medium mb-3">Pool Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-white/70">Pool Rate</p>
                      <p className="font-mono">1 BTC = 50,234.25 USDT</p>
                    </div>
                    <div>
                      <p className="text-white/70">Total Liquidity</p>
                      <p className="font-mono">$428.2M</p>
                    </div>
                    <div>
                      <p className="text-white/70">Your Share</p>
                      <p className="font-mono">0.00%</p>
                    </div>
                    <div>
                      <p className="text-white/70">Trading Fee</p>
                      <p className="font-mono">0.3%</p>
                    </div>
                    <div>
                      <p className="text-white/70">Farm APR</p>
                      <p className="font-mono text-green-400">24.6%</p>
                    </div>
                    <div>
                      <p className="text-white/70">Total APR</p>
                      <p className="font-mono text-green-400">27.8%</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#F2FF44] text-black hover:bg-[#E1EE33]" 
                  onClick={handleAddLiquidity}
                >
                  Add Liquidity
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white mt-4">
              <CardHeader>
                <CardTitle>Available Farming Pools</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white/70">Pool</TableHead>
                      <TableHead className="text-white/70">TVL</TableHead>
                      <TableHead className="text-white/70">Farm APR</TableHead>
                      <TableHead className="text-white/70">Total APR</TableHead>
                      <TableHead className="text-white/70"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center ring-2 ring-black z-10">
                              <span className="text-xs font-bold">B</span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-black">
                              <span className="text-xs font-bold">U</span>
                            </div>
                          </div>
                          <span>BTC-USDT</span>
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400/20 bg-yellow-400/5">Hot</Badge>
                        </div>
                      </TableCell>
                      <TableCell>$428.2M</TableCell>
                      <TableCell className="text-green-400">24.6%</TableCell>
                      <TableCell className="text-green-400">27.8%</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/10 hover:bg-white/10 hover:text-white"
                          onClick={() => setSelectedPair("BTC-USDT")}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-black z-10">
                              <span className="text-xs font-bold">E</span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-black">
                              <span className="text-xs font-bold">U</span>
                            </div>
                          </div>
                          <span>ETH-USDT</span>
                        </div>
                      </TableCell>
                      <TableCell>$312.5M</TableCell>
                      <TableCell className="text-green-400">18.9%</TableCell>
                      <TableCell className="text-green-400">21.2%</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/10 hover:bg-white/10 hover:text-white"
                          onClick={() => setSelectedPair("ETH-USDT")}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center ring-2 ring-black z-10">
                              <span className="text-xs font-bold">B</span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-black">
                              <span className="text-xs font-bold">E</span>
                            </div>
                          </div>
                          <span>BTC-ETH</span>
                          <Badge variant="outline" className="text-purple-400 border-purple-400/20 bg-purple-400/5">New</Badge>
                        </div>
                      </TableCell>
                      <TableCell>$98.7M</TableCell>
                      <TableCell className="text-green-400">32.4%</TableCell>
                      <TableCell className="text-green-400">35.1%</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/10 hover:bg-white/10 hover:text-white"
                          onClick={() => setSelectedPair("BTC-ETH")}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center ring-2 ring-black z-10">
                              <span className="text-xs font-bold">S</span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-black">
                              <span className="text-xs font-bold">U</span>
                            </div>
                          </div>
                          <span>SOL-USDT</span>
                        </div>
                      </TableCell>
                      <TableCell>$76.3M</TableCell>
                      <TableCell className="text-green-400">28.7%</TableCell>
                      <TableCell className="text-green-400">30.9%</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/10 hover:bg-white/10 hover:text-white"
                          onClick={() => setSelectedPair("SOL-USDT")}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-1/3">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Your Farming</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={farmTab} onValueChange={setFarmTab}>
                  <TabsList className="w-full bg-white/5 text-white">
                    <TabsTrigger value="active" className="data-[state=active]:bg-white/10">Active</TabsTrigger>
                    <TabsTrigger value="ended" className="data-[state=active]:bg-white/10">Ended</TabsTrigger>
                  </TabsList>
                  <TabsContent value="active" className="pt-4">
                    {isDemoMode ? (
                      <div className="space-y-4">
                        <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center ring-2 ring-black z-10">
                                  <span className="text-xs font-bold">B</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-black">
                                  <span className="text-xs font-bold">U</span>
                                </div>
                              </div>
                              <span className="font-medium">BTC-USDT</span>
                            </div>
                            <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-white/70">Your Liquidity</p>
                              <p className="font-mono">0.0125 BTC</p>
                              <p className="font-mono">628.42 USDT</p>
                            </div>
                            <div>
                              <p className="text-white/70">Value</p>
                              <p className="font-mono">$1,256.84</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white/70">Earned Rewards</span>
                              <span className="text-green-400">+2.34 VTEX</span>
                            </div>
                            <Progress value={68} className="h-2 bg-white/10" indicatorClassName="bg-[#F2FF44]" />
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:text-white">
                              Harvest
                            </Button>
                            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:text-white">
                              Withdraw
                            </Button>
                          </div>
                        </div>
                        
                        <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-black z-10">
                                  <span className="text-xs font-bold">E</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-black">
                                  <span className="text-xs font-bold">U</span>
                                </div>
                              </div>
                              <span className="font-medium">ETH-USDT</span>
                            </div>
                            <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-white/70">Your Liquidity</p>
                              <p className="font-mono">0.234 ETH</p>
                              <p className="font-mono">512.38 USDT</p>
                            </div>
                            <div>
                              <p className="text-white/70">Value</p>
                              <p className="font-mono">$1,024.76</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white/70">Earned Rewards</span>
                              <span className="text-green-400">+1.87 VTEX</span>
                            </div>
                            <Progress value={42} className="h-2 bg-white/10" indicatorClassName="bg-[#F2FF44]" />
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:text-white">
                              Harvest
                            </Button>
                            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:text-white">
                              Withdraw
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Wallet className="h-12 w-12 text-white/30 mb-3" />
                        <p className="text-white/70 mb-3">You don't have any active farming positions</p>
                        <Button className="bg-[#F2FF44] text-black hover:bg-[#E1EE33]">
                          Add Liquidity
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="ended" className="pt-4">
                    {isDemoMode ? (
                      <div className="space-y-4">
                        <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center ring-2 ring-black z-10">
                                  <span className="text-xs font-bold">S</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-black">
                                  <span className="text-xs font-bold">U</span>
                                </div>
                              </div>
                              <span className="font-medium">SOL-USDT</span>
                            </div>
                            <Badge className="bg-gray-500/20 text-gray-400">Ended</Badge>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-white/70">Your Liquidity</p>
                              <p className="font-mono">4.21 SOL</p>
                              <p className="font-mono">342.62 USDT</p>
                            </div>
                            <div>
                              <p className="text-white/70">Value</p>
                              <p className="font-mono">$685.24</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white/70">Earned Rewards</span>
                              <span className="text-green-400">+3.42 VTEX</span>
                            </div>
                            <Progress value={100} className="h-2 bg-white/10" indicatorClassName="bg-[#F2FF44]" />
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:text-white">
                              Claim All
                            </Button>
                            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:text-white">
                              Withdraw
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-white/70">
                        No ended farming positions
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white mt-4">
              <CardHeader>
                <CardTitle>Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                {isDemoMode ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                          <span className="text-xs font-bold">VTEX</span>
                        </div>
                        <div>
                          <div className="font-medium">Vertex Token</div>
                          <div className="text-xs text-white/70">Platform token</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">7.63 VTEX</div>
                        <div className="text-xs text-white/70">≈ $38.15</div>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-xs font-bold">USDT</span>
                        </div>
                        <div>
                          <div className="font-medium">Trading Fees</div>
                          <div className="text-xs text-white/70">Collected fees</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">12.84 USDT</div>
                        <div className="text-xs text-white/70">≈ $12.84</div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full border-white/10 hover:bg-white/10 hover:text-white"
                      >
                        Claim All Rewards
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-white/70">
                    No rewards available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Why Provide Liquidity?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <Percent className="h-4 w-4 text-[#F2FF44]" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Earn Trading Fees</div>
                      <div className="text-white/70">0.3% of all trades goes to liquidity providers</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-[#F2FF44]" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Farm Rewards</div>
                      <div className="text-white/70">Earn VTEX tokens for providing liquidity</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-[#F2FF44]" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">High APR</div>
                      <div className="text-white/70">Up to 35% APR on selected pools</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-white/50">
                  Note: Providing liquidity comes with risks including impermanent loss. Learn more about <a href="#" className="text-[#F2FF44] hover:underline inline-flex items-center">impermanent loss <ExternalLink className="h-3 w-3 ml-1" /></a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiquidityFarmingPage;