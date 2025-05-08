
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Search, Copy, Award, Trophy, TrendingUp, Users, Filter, ArrowUpDown, Eye, Clock, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const LeaderboardPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [timeframe, setTimeframe] = useState("weekly");
  const [category, setCategory] = useState("roi");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCopyTrader = (traderId: string) => {
    if (isDemoMode) {
      toast.success("Trader copied successfully!", {
        description: "You'll now automatically copy this trader's future positions."
      });
    } else {
      toast.error("Please enable demo mode to test this feature");
    }
  };

  // Helper function to generate random ROI
  const getRandomROI = (min: number, max: number, negative: boolean = false) => {
    const val = (Math.random() * (max - min) + min).toFixed(2);
    return negative ? `-${val}%` : `+${val}%`;
  };

  // Sample trader data for the leaderboard
  const traders = [
    { id: "1", name: "CryptoWhale", avatar: "CW", roi: "+287.32%", winRate: "76%", trades: 342, followers: 15482, badges: ["VIP", "Verified"], anonymity: false },
    { id: "2", name: "BTCHunter", avatar: "BH", roi: "+189.45%", winRate: "72%", trades: 524, followers: 8304, badges: ["Verified"], anonymity: false },
    { id: "3", name: "Trader_23ABF", avatar: "T2", roi: "+156.18%", winRate: "68%", trades: 211, followers: 6201, badges: [], anonymity: true },
    { id: "4", name: "AlphaSeeker", avatar: "AS", roi: "+142.93%", winRate: "65%", trades: 482, followers: 5842, badges: ["VIP"], anonymity: false },
    { id: "5", name: "Satoshi_Jr", avatar: "SJ", roi: "+128.56%", winRate: "63%", trades: 327, followers: 4291, badges: ["Verified"], anonymity: false },
    { id: "6", name: "HodlKing", avatar: "HK", roi: "+112.78%", winRate: "61%", trades: 184, followers: 3762, badges: [], anonymity: false },
    { id: "7", name: "Trader_94FGH", avatar: "T9", roi: "+98.34%", winRate: "59%", trades: 492, followers: 2198, badges: [], anonymity: true },
    { id: "8", name: "CryptoNinja", avatar: "CN", roi: "+87.21%", winRate: "58%", trades: 378, followers: 1845, badges: ["Verified"], anonymity: false },
    { id: "9", name: "BearHunter", avatar: "BH", roi: "+79.67%", winRate: "56%", trades: 246, followers: 1432, badges: [], anonymity: false },
    { id: "10", name: "Trader_78JKL", avatar: "T7", roi: "+65.42%", winRate: "53%", trades: 319, followers: 987, badges: [], anonymity: true },
  ];

  // Filter traders based on search query
  const filteredTraders = traders.filter(trader => 
    trader.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
              <div>
                <CardTitle>Trading Leaderboard</CardTitle>
                <CardDescription>Top traders ranked by performance</CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search traders..."
                    className="pl-8 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="weekly" onValueChange={setTimeframe} className="mb-4">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="all-time">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs defaultValue="roi" onValueChange={setCategory}>
              <TabsList>
                <TabsTrigger value="roi">ROI</TabsTrigger>
                <TabsTrigger value="win-rate">Win Rate</TabsTrigger>
                <TabsTrigger value="volume">Trading Volume</TabsTrigger>
                <TabsTrigger value="followers">Followers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="roi" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Trader</TableHead>
                      <TableHead className="text-right">ROI ({timeframe})</TableHead>
                      <TableHead className="text-right">Win Rate</TableHead>
                      <TableHead className="text-right">Trades</TableHead>
                      <TableHead className="text-right">Followers</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTraders.map((trader, index) => (
                      <TableRow key={trader.id}>
                        <TableCell className="font-medium">
                          {index === 0 ? <Trophy className="h-5 w-5 text-yellow-500" /> : 
                           index === 1 ? <Trophy className="h-5 w-5 text-gray-400" /> : 
                           index === 2 ? <Trophy className="h-5 w-5 text-amber-700" /> : 
                           (index + 1)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarFallback>{trader.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{trader.name}</div>
                              <div className="flex space-x-1">
                                {trader.badges.includes("VIP") && 
                                  <Badge variant="outline" className="text-xs px-1 py-0 bg-amber-500/10 text-amber-500 border-amber-500/20">VIP</Badge>
                                }
                                {trader.badges.includes("Verified") && 
                                  <Badge variant="outline" className="text-xs px-1 py-0 bg-blue-500/10 text-blue-500 border-blue-500/20">Verified</Badge>
                                }
                                {trader.anonymity && 
                                  <Badge variant="outline" className="text-xs px-1 py-0">Anon</Badge>
                                }
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-500">{trader.roi}</TableCell>
                        <TableCell className="text-right font-mono">{trader.winRate}</TableCell>
                        <TableCell className="text-right font-mono">{trader.trades}</TableCell>
                        <TableCell className="text-right font-mono">{trader.followers.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleCopyTrader(trader.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="win-rate" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Trader</TableHead>
                      <TableHead className="text-right">Win Rate</TableHead>
                      <TableHead className="text-right">ROI ({timeframe})</TableHead>
                      <TableHead className="text-right">Trades</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Win rate tab content would go here */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarFallback>TS</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">TradeSurfer</div>
                            <div className="flex space-x-1">
                              <Badge variant="outline" className="text-xs px-1 py-0 bg-blue-500/10 text-blue-500 border-blue-500/20">Verified</Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">81%</TableCell>
                      <TableCell className="text-right font-mono text-green-500">+176.42%</TableCell>
                      <TableCell className="text-right font-mono">245</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              
              {/* Other tabs would be implemented similarly */}
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              {isDemoMode ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Badge className="mb-2 text-lg px-4 py-2 bg-primary/20">#437</Badge>
                  <p className="text-sm text-muted-foreground">Out of 24,831 traders</p>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Your ROI</p>
                      <p className="text-green-500 font-mono">+12.45%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Win Rate</p>
                      <p className="font-mono">56%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Trades</p>
                      <p className="font-mono">28</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Followers</p>
                      <p className="font-mono">3</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">Enable demo mode to see your ranking</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">HIGHEST ROI (WEEKLY)</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>CW</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">CryptoWhale</div>
                        <div className="text-xs text-muted-foreground">342 trades</div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500">+287.32%</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">HIGHEST WIN RATE</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>TS</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">TradeSurfer</div>
                        <div className="text-xs text-muted-foreground">245 trades</div>
                      </div>
                    </div>
                    <Badge variant="outline">81%</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">MOST COPIED</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>CW</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">CryptoWhale</div>
                        <div className="text-xs text-muted-foreground">15,482 followers</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Copied Traders</CardTitle>
            </CardHeader>
            <CardContent>
              {isDemoMode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>CW</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">CryptoWhale</div>
                        <div className="text-xs text-muted-foreground">Copied 2 days ago</div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500">+12.4%</Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>BH</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">BTCHunter</div>
                        <div className="text-xs text-muted-foreground">Copied 5 days ago</div>
                      </div>
                    </div>
                    <Badge className="bg-red-500/20 text-red-500">-2.8%</Badge>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      <Users className="mr-2 h-4 w-4" />
                      Find Traders to Copy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">Enable demo mode to see your copied traders</p>
                  <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Find Traders to Copy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeaderboardPage;
