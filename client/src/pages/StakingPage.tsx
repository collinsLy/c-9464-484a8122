import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Calculator, Clock, CalendarDays, Shield, Lock, ArrowUpRight, ChevronDown, ChevronUp, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const StakingPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedAsset, setSelectedAsset] = useState("VTEX");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("30");
  const [autoCompound, setAutoCompound] = useState(true);
  const [stakeTab, setStakeTab] = useState("active");

  const assets = [
    { id: "VTEX", name: "Vertex Token", balance: "324.57", price: "$5.12", apy: "18.5%" },
    { id: "BTC", name: "Bitcoin", balance: "0.148", price: "$51,245.32", apy: "8.4%" },
    { id: "ETH", name: "Ethereum", balance: "2.35", price: "$2,876.49", apy: "12.3%" },
    { id: "SOL", name: "Solana", balance: "45.78", price: "$132.65", apy: "15.8%" },
    { id: "DOT", name: "Polkadot", balance: "145.87", price: "$18.45", apy: "22.4%" },
  ];

  const selectedAssetData = assets.find(asset => asset.id === selectedAsset);

  const handleStake = () => {
    if (isDemoMode) {
      toast.success("Successfully staked", {
        description: `Staked ${amount} ${selectedAsset} for ${duration} days`,
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
            <h1 className="text-3xl font-bold text-white">Staking</h1>
            <p className="text-sm text-white/70 mt-1">Stake assets to earn passive rewards</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Stake Assets</CardTitle>
                <CardDescription className="text-white/70">Lock your assets and earn rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white/70">Select Asset</Label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {assets.map(asset => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center mr-2">
                              <span className="text-[10px] font-bold">{asset.id.substring(0, 1)}</span>
                            </div>
                            {asset.name} ({asset.id})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                        <span className="text-xs font-bold">{selectedAssetData?.id}</span>
                      </div>
                      <div>
                        <span className="font-medium">{selectedAssetData?.name}</span>
                        <div className="text-xs text-white/70">
                          {selectedAssetData?.price} • {selectedAssetData?.apy} APY
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-white/70 border-white/10">
                      Balance: {isDemoMode ? selectedAssetData?.balance : "0.00"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">Stake Amount</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="0.00"
                        className="bg-transparent border-white/10 text-white"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-sm text-white/70">{selectedAsset}</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="text-xs text-white/70 hover:text-white hover:bg-white/10">MAX</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Lock Duration</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-white/5 ${
                        duration === "30" ? "border-[#F2FF44]" : "border-white/10"
                      }`}
                      onClick={() => setDuration("30")}
                    >
                      <CalendarDays className="mb-2 h-6 w-6 text-white/70" />
                      <span className="block text-xl font-medium">30</span>
                      <span className="block text-xs text-white/70">Days</span>
                      <span className="mt-1 block text-xs font-medium text-green-400">+{(parseFloat(selectedAssetData?.apy || "0") * 0.7).toFixed(1)}%</span>
                    </div>
                    <div
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-white/5 ${
                        duration === "60" ? "border-[#F2FF44]" : "border-white/10"
                      }`}
                      onClick={() => setDuration("60")}
                    >
                      <CalendarDays className="mb-2 h-6 w-6 text-white/70" />
                      <span className="block text-xl font-medium">60</span>
                      <span className="block text-xs text-white/70">Days</span>
                      <span className="mt-1 block text-xs font-medium text-green-400">+{(parseFloat(selectedAssetData?.apy || "0") * 0.85).toFixed(1)}%</span>
                    </div>
                    <div
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-white/5 ${
                        duration === "90" ? "border-[#F2FF44]" : "border-white/10"
                      }`}
                      onClick={() => setDuration("90")}
                    >
                      <CalendarDays className="mb-2 h-6 w-6 text-white/70" />
                      <span className="block text-xl font-medium">90</span>
                      <span className="block text-xs text-white/70">Days</span>
                      <span className="mt-1 block text-xs font-medium text-green-400">+{parseFloat(selectedAssetData?.apy || "0")}%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                  <h3 className="font-medium mb-3">Staking Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/70">APY</p>
                      <p className="font-medium text-green-400">{duration === "30" ? (parseFloat(selectedAssetData?.apy || "0") * 0.7).toFixed(1) : 
                         duration === "60" ? (parseFloat(selectedAssetData?.apy || "0") * 0.85).toFixed(1) : 
                         selectedAssetData?.apy}%</p>
                    </div>
                    <div>
                      <p className="text-white/70">Lock Period</p>
                      <p className="font-medium">{duration} days</p>
                    </div>
                    <div>
                      <p className="text-white/70">Unlock Date</p>
                      <p className="font-medium">{new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Early Unstake Fee</p>
                      <p className="font-medium text-amber-400">10%</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-compound" 
                    checked={autoCompound}
                    onCheckedChange={setAutoCompound}
                    className="data-[state=checked]:bg-[#F2FF44]"
                  />
                  <Label htmlFor="auto-compound" className="text-white">Auto-compound rewards</Label>
                </div>

                <Button 
                  className="w-full bg-[#F2FF44] text-black hover:bg-[#E1EE33]" 
                  onClick={handleStake}
                >
                  Stake {selectedAsset}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white mt-4">
              <CardHeader>
                <CardTitle>Available Staking Options</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white/70">Asset</TableHead>
                      <TableHead className="text-white/70">Lock Duration</TableHead>
                      <TableHead className="text-white/70">APY</TableHead>
                      <TableHead className="text-white/70">Total Staked</TableHead>
                      <TableHead className="text-white/70"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                            <span className="text-xs font-bold">V</span>
                          </div>
                          <div>
                            <div className="font-medium">Vertex Token</div>
                            <div className="text-xs text-white/70">VTEX</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>90 Days</TableCell>
                      <TableCell className="text-green-400">18.5%</TableCell>
                      <TableCell>$4.2M</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/10 hover:bg-white/10 hover:text-white"
                          onClick={() => {
                            setSelectedAsset("VTEX");
                            setDuration("90");
                          }}
                        >
                          Stake
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="text-xs font-bold">B</span>
                          </div>
                          <div>
                            <div className="font-medium">Bitcoin</div>
                            <div className="text-xs text-white/70">BTC</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>90 Days</TableCell>
                      <TableCell className="text-green-400">8.4%</TableCell>
                      <TableCell>$128.7M</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/10 hover:bg-white/10 hover:text-white"
                          onClick={() => {
                            setSelectedAsset("BTC");
                            setDuration("90");
                          }}
                        >
                          Stake
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-xs font-bold">E</span>
                          </div>
                          <div>
                            <div className="font-medium">Ethereum</div>
                            <div className="text-xs text-white/70">ETH</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>90 Days</TableCell>
                      <TableCell className="text-green-400">12.3%</TableCell>
                      <TableCell>$82.4M</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/10 hover:bg-white/10 hover:text-white"
                          onClick={() => {
                            setSelectedAsset("ETH");
                            setDuration("90");
                          }}
                        >
                          Stake
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-xs font-bold">D</span>
                          </div>
                          <div>
                            <div className="font-medium">Polkadot</div>
                            <div className="text-xs text-white/70">DOT</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>90 Days</TableCell>
                      <TableCell className="text-green-400">22.4%</TableCell>
                      <TableCell>$31.8M</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/10 hover:bg-white/10 hover:text-white"
                          onClick={() => {
                            setSelectedAsset("DOT");
                            setDuration("90");
                          }}
                        >
                          Stake
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
                <CardTitle>Your Staked Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={stakeTab} onValueChange={setStakeTab}>
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
                              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                                <span className="text-xs font-bold">V</span>
                              </div>
                              <div>
                                <div className="font-medium">Vertex Token</div>
                                <div className="text-xs text-white/70">90 days lock</div>
                              </div>
                            </div>
                            <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Staked Amount</span>
                              <span className="font-mono">200 VTEX</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-white/70">APY</span>
                              <span className="font-mono text-green-400">18.5%</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white/70">Unlocks in</span>
                              <span>42 days</span>
                            </div>
                            <Progress value={53} className="h-2 bg-white/10" indicatorClassName="bg-[#F2FF44]" />
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Rewards Earned</span>
                              <span className="font-mono text-green-400">+8.45 VTEX</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:text-white">
                              Claim Rewards
                            </Button>
                            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:text-white text-amber-400">
                              Unstake Early
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-xs font-bold">E</span>
                              </div>
                              <div>
                                <div className="font-medium">Ethereum</div>
                                <div className="text-xs text-white/70">60 days lock</div>
                              </div>
                            </div>
                            <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Staked Amount</span>
                              <span className="font-mono">1.2 ETH</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-white/70">APY</span>
                              <span className="font-mono text-green-400">10.5%</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white/70">Unlocks in</span>
                              <span>18 days</span>
                            </div>
                            <Progress value={70} className="h-2 bg-white/10" indicatorClassName="bg-[#F2FF44]" />
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Rewards Earned</span>
                              <span className="font-mono text-green-400">+0.034 ETH</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:text-white">
                              Claim Rewards
                            </Button>
                            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:text-white text-amber-400">
                              Unstake Early
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Lock className="h-12 w-12 text-white/30 mb-3" />
                        <p className="text-white/70 mb-3">You don't have any staked assets</p>
                        <Button className="bg-[#F2FF44] text-black hover:bg-[#E1EE33]">
                          Stake Now
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
                              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                                <span className="text-xs font-bold">S</span>
                              </div>
                              <div>
                                <div className="font-medium">Solana</div>
                                <div className="text-xs text-white/70">30 days lock</div>
                              </div>
                            </div>
                            <Badge className="bg-gray-500/20 text-gray-400">Ended</Badge>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Staked Amount</span>
                              <span className="font-mono">25.4 SOL</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-white/70">APY</span>
                              <span className="font-mono text-green-400">11.1%</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white/70">Status</span>
                              <span>Completed on {new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                            </div>
                            <Progress value={100} className="h-2 bg-white/10" indicatorClassName="bg-[#F2FF44]" />
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Rewards Earned</span>
                              <span className="font-mono text-green-400">+0.72 SOL</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            <Button variant="outline" size="sm" className="w-full border-white/10 hover:bg-white/10 hover:text-white">
                              Withdraw All
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-white/70">
                        No ended staking positions
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white mt-4">
              <CardHeader>
                <CardTitle>Rewards Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Asset</Label>
                    <Select defaultValue="VTEX">
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        {assets.map(asset => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name} ({asset.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">Amount</Label>
                    <Input type="text" placeholder="0.00" defaultValue="100" className="bg-white/5 border-white/10 text-white" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">Duration</Label>
                    <Select defaultValue="90">
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="60">60 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">Auto-compound</Label>
                    <Select defaultValue="yes">
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/10 hover:text-white">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate
                  </Button>

                  <div className="rounded-lg bg-white/5 p-4 border border-white/10 mt-4">
                    <h3 className="font-medium mb-3">Estimated Returns</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Initial Investment</span>
                        <span className="font-mono">100 VTEX</span>
                      </div>

                      <Separator className="bg-white/10" />

                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">APY</span>
                        <span className="font-mono">18.5%</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Duration</span>
                        <span className="font-mono">90 days</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Rewards</span>
                        <span className="font-mono text-green-400">+4.56 VTEX</span>
                      </div>

                      <Separator className="bg-white/10" />

                      <div className="flex justify-between text-sm font-medium">
                        <span>Total Value</span>
                        <span className="font-mono text-green-400">104.56 VTEX</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Why Stake?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-[#F2FF44]" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Passive Income</div>
                      <div className="text-white/70">Earn up to 22.4% APY on your digital assets</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-[#F2FF44]" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Security</div>
                      <div className="text-white/70">Assets are secured by institutional-grade security</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 text-[#F2FF44]" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Compound Growth</div>
                      <div className="text-white/70">Auto-compound feature for maximizing returns</div>
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

export default StakingPage;