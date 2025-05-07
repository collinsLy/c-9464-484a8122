
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, TrendingUp, Award, Filter } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock data for traders
const topTraders = [
  {
    id: '1',
    name: 'Alex Crypto',
    username: 'alexcrypto',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    roi: 286.4,
    followers: 12453,
    trades: 1432,
    winRate: 78,
    description: 'Specializing in Bitcoin and Ethereum trading with 5+ years experience.',
    verified: true,
    fee: 2.5,
    assets: ['BTC', 'ETH', 'SOL'],
    following: false
  },
  {
    id: '2',
    name: 'Sophia Invest',
    username: 'sophiainvest',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    roi: 167.2,
    followers: 8764,
    trades: 987,
    winRate: 72,
    description: 'Technical analyst focusing on altcoins and emerging markets.',
    verified: true,
    fee: 2.0,
    assets: ['DOT', 'ADA', 'LINK'],
    following: true
  },
  {
    id: '3',
    name: 'CryptoWhale',
    username: 'cryptowhale',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Whale',
    roi: 412.9,
    followers: 24567,
    trades: 2156,
    winRate: 81,
    description: 'Professional day trader with background in traditional finance.',
    verified: true,
    fee: 3.0,
    assets: ['BTC', 'ETH', 'SOL', 'AVAX'],
    following: false
  },
  {
    id: '4',
    name: 'BlockchainMaster',
    username: 'blockchainmaster',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Master',
    roi: 134.6,
    followers: 5621,
    trades: 754,
    winRate: 68,
    description: 'Focusing on DeFi projects and yield farming strategies.',
    verified: false,
    fee: 1.5,
    assets: ['UNI', 'AAVE', 'COMP'],
    following: false
  },
  {
    id: '5',
    name: 'TradingSage',
    username: 'tradingsage',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sage',
    roi: 203.8,
    followers: 9321,
    trades: 1123,
    winRate: 74,
    description: 'AI-driven trading with proven strategies across market cycles.',
    verified: true,
    fee: 2.2,
    assets: ['BTC', 'ETH', 'MATIC'],
    following: true
  }
];

const SocialTradingPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const [sortBy, setSortBy] = useState('roi');
  const [traders, setTraders] = useState(topTraders);

  const handleFollow = (id: string) => {
    setTraders(traders.map(trader => 
      trader.id === id ? {...trader, following: !trader.following} : trader
    ));
  };

  // Filter traders based on search query
  const filteredTraders = traders.filter(trader => 
    trader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trader.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trader.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort traders based on selected criteria
  const sortedTraders = [...filteredTraders].sort((a, b) => {
    if (sortBy === 'roi') return b.roi - a.roi;
    if (sortBy === 'followers') return b.followers - a.followers;
    if (sortBy === 'winRate') return b.winRate - a.winRate;
    return 0;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Social Trading</h1>
            <p className="text-sm text-white/70 mt-1">Follow and copy successful traders</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>
        
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Start Social Trading</CardTitle>
            <CardDescription className="text-white/70">
              Follow experienced traders and automatically copy their trading strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Follow Top Traders</h3>
                    <p className="text-white/70">Browse through our curated list of successful traders with verified track records.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Copy Their Trades</h3>
                    <p className="text-white/70">Automatically replicate trades from your chosen traders in real-time.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-background/20 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Your Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/70">Following</p>
                    <p className="text-2xl font-bold">{traders.filter(t => t.following).length}</p>
                  </div>
                  <div>
                    <p className="text-white/70">Profit from Copying</p>
                    <p className="text-2xl font-bold text-green-500">+$126.45</p>
                  </div>
                  <div>
                    <p className="text-white/70">Best Performer</p>
                    <p className="text-lg font-medium">Sophia Invest</p>
                  </div>
                  <div>
                    <p className="text-white/70">Total Copied Trades</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <Input 
                type="text"
                placeholder="Search traders by name or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background/40 border-white/10 text-white pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-white/70" />
              <span className="text-white/70">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-background/40 text-white border border-white/10 rounded-md p-2"
              >
                <option value="roi">Highest ROI</option>
                <option value="followers">Most Followers</option>
                <option value="winRate">Best Win Rate</option>
              </select>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-6">
              <TabsTrigger value="discover" className="text-white data-[state=active]:bg-accent">
                Discover
              </TabsTrigger>
              <TabsTrigger value="following" className="text-white data-[state=active]:bg-accent">
                Following ({traders.filter(t => t.following).length})
              </TabsTrigger>
              <TabsTrigger value="popular" className="text-white data-[state=active]:bg-accent">
                Popular
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="discover" className="space-y-4">
              {sortedTraders.map((trader) => (
                <Card key={trader.id} className="bg-background/40 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={trader.avatar} />
                          <AvatarFallback>{trader.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{trader.name}</h3>
                            {trader.verified && (
                              <Badge className="bg-accent text-white">Verified</Badge>
                            )}
                          </div>
                          <p className="text-white/70">@{trader.username}</p>
                          <p className="text-sm mt-2">{trader.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {trader.assets.map((asset) => (
                              <Badge key={asset} variant="outline" className="text-xs">
                                {asset}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4 flex flex-col items-end justify-between">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-white/70 text-sm">ROI</p>
                            <p className="text-lg font-bold text-green-500">+{trader.roi}%</p>
                          </div>
                          <div>
                            <p className="text-white/70 text-sm">Followers</p>
                            <p className="text-lg font-bold">{(trader.followers / 1000).toFixed(1)}k</p>
                          </div>
                          <div>
                            <p className="text-white/70 text-sm">Win Rate</p>
                            <p className="text-lg font-bold">{trader.winRate}%</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-white/70 text-sm">Fee: {trader.fee}% of profits</p>
                          <Button 
                            variant={trader.following ? "secondary" : "default"}
                            onClick={() => handleFollow(trader.id)}
                            className={trader.following ? "bg-white/10 hover:bg-white/20 text-white" : ""}
                          >
                            {trader.following ? "Following" : "Follow & Copy"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="following" className="space-y-4">
              {sortedTraders.filter(t => t.following).length > 0 ? (
                sortedTraders.filter(t => t.following).map((trader) => (
                  <Card key={trader.id} className="bg-background/40 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={trader.avatar} />
                            <AvatarFallback>{trader.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{trader.name}</h3>
                              {trader.verified && (
                                <Badge className="bg-accent text-white">Verified</Badge>
                              )}
                            </div>
                            <p className="text-white/70">@{trader.username}</p>
                            <p className="text-sm mt-2">{trader.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {trader.assets.map((asset) => (
                                <Badge key={asset} variant="outline" className="text-xs">
                                  {asset}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4 flex flex-col items-end justify-between">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-white/70 text-sm">ROI</p>
                              <p className="text-lg font-bold text-green-500">+{trader.roi}%</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm">Followers</p>
                              <p className="text-lg font-bold">{(trader.followers / 1000).toFixed(1)}k</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm">Win Rate</p>
                              <p className="text-lg font-bold">{trader.winRate}%</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-white/70 text-sm">Fee: {trader.fee}% of profits</p>
                            <Button 
                              variant="secondary"
                              onClick={() => handleFollow(trader.id)}
                              className="bg-white/10 hover:bg-white/20 text-white"
                            >
                              Following
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">You're not following any traders yet</h3>
                  <p className="text-white/70 mb-6">Discover and follow top traders to copy their strategies</p>
                  <Button onClick={() => setActiveTab('discover')}>
                    Discover Traders
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular" className="space-y-4">
              {sortedTraders
                .sort((a, b) => b.followers - a.followers)
                .slice(0, 3)
                .map((trader) => (
                  <Card key={trader.id} className="bg-background/40 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={trader.avatar} />
                            <AvatarFallback>{trader.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{trader.name}</h3>
                              {trader.verified && (
                                <Badge className="bg-accent text-white">Verified</Badge>
                              )}
                            </div>
                            <p className="text-white/70">@{trader.username}</p>
                            <p className="text-sm mt-2">{trader.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {trader.assets.map((asset) => (
                                <Badge key={asset} variant="outline" className="text-xs">
                                  {asset}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4 flex flex-col items-end justify-between">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-white/70 text-sm">ROI</p>
                              <p className="text-lg font-bold text-green-500">+{trader.roi}%</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm">Followers</p>
                              <p className="text-lg font-bold">{(trader.followers / 1000).toFixed(1)}k</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm">Win Rate</p>
                              <p className="text-lg font-bold">{trader.winRate}%</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-white/70 text-sm">Fee: {trader.fee}% of profits</p>
                            <Button 
                              variant={trader.following ? "secondary" : "default"}
                              onClick={() => handleFollow(trader.id)}
                              className={trader.following ? "bg-white/10 hover:bg-white/20 text-white" : ""}
                            >
                              {trader.following ? "Following" : "Follow & Copy"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SocialTradingPage;
