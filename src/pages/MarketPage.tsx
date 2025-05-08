
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { CoinGeckoData } from '@/components/markets/CoinGeckoData';
import { BinanceOrderBook } from '@/components/markets/BinanceOrderBook';
import { MarketNews } from '@/components/markets/MarketNews';
import { TwelveDataTicker } from '@/components/markets/TwelveDataTicker';
import { Search, ArrowUpDown, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getTopCoins, getCoinPrice } from '@/lib/api/coingecko';
import { binanceService } from '@/lib/binance-service';

// Define the type for the market data
interface StockData {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
}

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline?: number[];
}

const MarketPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState("BTCUSDT");
  const [selectedStockSymbol, setSelectedStockSymbol] = useState("AAPL");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [selectedTab, setSelectedTab] = useState("crypto");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const data = await getTopCoins();
      setCryptoData(data.slice(0, 20));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      // Fallback to demo data if API fails
      if (isDemoMode) {
        setCryptoData(generateDemoCryptoData());
      }
      toast.error('Could not fetch cryptocurrency data');
      setLoading(false);
    }
  };

  const fetchStockData = async () => {
    try {
      setLoading(true);
      // Using Alpha Vantage API key from your file
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${selectedStockSymbol}&apikey=BUURNND6LTNPWVJE`
      );
      const data = await response.json();

      if (data["Global Quote"]) {
        setStockData({
          symbol: data["Global Quote"]["01. symbol"],
          price: data["Global Quote"]["05. price"],
          change: data["Global Quote"]["09. change"],
          changePercent: data["Global Quote"]["10. change percent"],
        });
      } else {
        // Fallback to demo data if API fails or is rate limited
        setStockData(generateDemoStockData(selectedStockSymbol));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Fallback to demo data if API fails
      setStockData(generateDemoStockData(selectedStockSymbol));
      toast.error('Could not fetch stock data');
      setLoading(false);
    }
  };

  // Fetch real-time data on mount and when symbols change
  useEffect(() => {
    fetchCryptoData();
    
    // Set up interval to refresh data
    const interval = setInterval(() => {
      fetchCryptoData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [isDemoMode]);

  useEffect(() => {
    if (selectedTab === 'stocks') {
      fetchStockData();
      
      // Set up interval to refresh data
      const interval = setInterval(fetchStockData, 60000);
      return () => clearInterval(interval);
    }
  }, [selectedStockSymbol, selectedTab]);

  // Generate demo data for fallback
  const generateDemoCryptoData = (): CryptoData[] => {
    const cryptos = [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
      { id: 'binancecoin', symbol: 'bnb', name: 'Binance Coin', image: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png' },
      { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
      { id: 'ripple', symbol: 'xrp', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
    ];
    
    return cryptos.map(crypto => ({
      ...crypto,
      current_price: Math.random() * 10000 + 100,
      price_change_percentage_24h: (Math.random() * 10) - 5,
      market_cap: Math.random() * 1000000000000,
      total_volume: Math.random() * 50000000000,
      sparkline: Array.from({ length: 24 }, () => Math.random() * 100 + 50)
    }));
  };

  const generateDemoStockData = (symbol: string): StockData => {
    const price = Math.random() * 200 + 50;
    const change = (Math.random() * 10) - 5;
    const percent = (change / price) * 100;
    
    return {
      symbol,
      price: price.toFixed(2),
      change: change.toFixed(2),
      changePercent: `${percent.toFixed(2)}%`,
    };
  };

  const filteredCryptoData = cryptoData.filter(
    item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mb-8">Markets</h1>
        
        <Tabs defaultValue="crypto" className="w-full" onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 bg-background/40 backdrop-blur-lg mb-6">
            <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
            <TabsTrigger value="stocks">Stocks & ETFs</TabsTrigger>
            <TabsTrigger value="news">Market News</TabsTrigger>
          </TabsList>
          
          <TabsContent value="crypto" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center w-1/2">
                <Input 
                  placeholder="Search cryptocurrencies..." 
                  className="bg-background/40 border-white/10 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button size="icon" variant="ghost" className="ml-2">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="outline" className="bg-background/40 border-white/10 text-white">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-background/40 backdrop-blur-lg border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white">Top Cryptocurrencies</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-white">Loading market data...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-white">Name</TableHead>
                          <TableHead className="text-white text-right">Price</TableHead>
                          <TableHead className="text-white text-right">24h Change</TableHead>
                          <TableHead className="text-white text-right">Market Cap</TableHead>
                          <TableHead className="text-white text-right">Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCryptoData.map((coin) => (
                          <TableRow 
                            key={coin.id} 
                            className="border-white/10 hover:bg-white/5 cursor-pointer"
                            onClick={() => setSelectedCryptoSymbol(coin.symbol.toUpperCase() + 'USDT')}
                          >
                            <TableCell className="text-white flex items-center space-x-2">
                              <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                              <span>{coin.name}</span>
                              <span className="text-white/60">{coin.symbol.toUpperCase()}</span>
                            </TableCell>
                            <TableCell className="text-white text-right">
                              ${coin.current_price.toLocaleString('en-US', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </TableCell>
                            <TableCell className={`text-right ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              <div className="flex items-center justify-end space-x-1">
                                {coin.price_change_percentage_24h >= 0 ? 
                                  <ChevronUp className="h-4 w-4" /> : 
                                  <ChevronDown className="h-4 w-4" />
                                }
                                <span>{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-white text-right">
                              ${(coin.market_cap / 1000000000).toFixed(2)}B
                            </TableCell>
                            <TableCell className="text-white text-right">
                              ${(coin.total_volume / 1000000).toFixed(2)}M
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card className="bg-background/40 backdrop-blur-lg border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">Order Book</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BinanceOrderBook symbol={selectedCryptoSymbol} />
                  </CardContent>
                </Card>
                
                <Card className="bg-background/40 backdrop-blur-lg border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">Latest Market Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span className="text-white">New ATH: ETH at $4,800</span>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                        <Sparkles className="h-4 w-4 text-green-500" />
                        <span className="text-white">SOL volume up 35% in 24h</span>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        <span className="text-white">BNB burns scheduled for next week</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <CoinGeckoData />
          </TabsContent>
          
          <TabsContent value="stocks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-background/40 backdrop-blur-lg border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white">Stock Market</CardTitle>
                </CardHeader>
                <CardContent>
                  <TwelveDataTicker />
                </CardContent>
              </Card>
              
              <Card className="bg-background/40 backdrop-blur-lg border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white">{selectedStockSymbol} Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading || !stockData ? (
                    <div className="text-center py-8 text-white">Loading stock data...</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center">
                        <h3 className="text-2xl font-bold text-white">${parseFloat(stockData.price).toFixed(2)}</h3>
                        <div className={`flex items-center space-x-1 ${parseFloat(stockData.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {parseFloat(stockData.change) >= 0 ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                          <span>{stockData.change} ({stockData.changePercent})</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <Button 
                          variant="outline" 
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                          onClick={() => setSelectedStockSymbol("AAPL")}
                        >
                          AAPL
                        </Button>
                        <Button 
                          variant="outline" 
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                          onClick={() => setSelectedStockSymbol("MSFT")}
                        >
                          MSFT
                        </Button>
                        <Button 
                          variant="outline" 
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                          onClick={() => setSelectedStockSymbol("GOOGL")}
                        >
                          GOOGL
                        </Button>
                        <Button 
                          variant="outline" 
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                          onClick={() => setSelectedStockSymbol("AMZN")}
                        >
                          AMZN
                        </Button>
                        <Button 
                          variant="outline" 
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                          onClick={() => setSelectedStockSymbol("TSLA")}
                        >
                          TSLA
                        </Button>
                        <Button 
                          variant="outline" 
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                          onClick={() => setSelectedStockSymbol("META")}
                        >
                          META
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="news" className="space-y-6">
            <MarketNews />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MarketPage;
