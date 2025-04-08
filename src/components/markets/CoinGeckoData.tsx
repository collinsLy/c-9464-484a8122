
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCoinGeckoData, getCoinMarketData } from "@/lib/api/coingecko";

interface CoinGeckoDataProps {
  symbol: string;
}

const CoinGeckoData = ({ symbol }: CoinGeckoDataProps) => {
  const coinId = symbol.toLowerCase();
  
  // Fetch coin data
  const { data: coinData, isLoading: isLoadingCoinData } = useQuery({
    queryKey: ['coinData', coinId],
    queryFn: () => fetchCoinGeckoData(coinId),
  });
  
  // Fetch top coins
  const { data: topCoins, isLoading: isLoadingTopCoins } = useQuery({
    queryKey: ['topCoins'],
    queryFn: () => getCoinMarketData(['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 'solana', 'polkadot', 'dogecoin']),
  });
  
  // Calculate 24h change
  const change24h = coinData?.market_data?.price_change_percentage_24h || 0;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white lg:col-span-2">
        <CardHeader>
          <CardTitle>{isLoadingCoinData ? <Skeleton className="h-8 w-48 bg-white/10" /> : coinData?.name} Market Data</CardTitle>
          <CardDescription className="text-white/70">
            Comprehensive market data from CoinGecko
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Price Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">Current Price</dt>
                  <dd className="font-medium">
                    {isLoadingCoinData ? (
                      <Skeleton className="h-5 w-20 bg-white/10" />
                    ) : (
                      `$${coinData?.market_data?.current_price?.usd?.toLocaleString() || "0.00"}`
                    )}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">24h Change</dt>
                  <dd className={change24h >= 0 ? "text-green-400" : "text-red-400"}>
                    {isLoadingCoinData ? (
                      <Skeleton className="h-5 w-16 bg-white/10" />
                    ) : (
                      `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`
                    )}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">All-Time High</dt>
                  <dd className="font-medium">
                    {isLoadingCoinData ? (
                      <Skeleton className="h-5 w-20 bg-white/10" />
                    ) : (
                      `$${coinData?.market_data?.ath?.usd?.toLocaleString() || "0.00"}`
                    )}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">ATH Date</dt>
                  <dd>
                    {isLoadingCoinData ? (
                      <Skeleton className="h-5 w-24 bg-white/10" />
                    ) : (
                      new Date(coinData?.market_data?.ath_date?.usd || "").toLocaleDateString() || "N/A"
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Market Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">Market Cap Rank</dt>
                  <dd>
                    {isLoadingCoinData ? (
                      <Skeleton className="h-5 w-8 bg-white/10" />
                    ) : (
                      `#${coinData?.market_cap_rank || "N/A"}`
                    )}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">Market Cap</dt>
                  <dd>
                    {isLoadingCoinData ? (
                      <Skeleton className="h-5 w-20 bg-white/10" />
                    ) : (
                      `$${((coinData?.market_data?.market_cap?.usd || 0) / 1000000000).toFixed(2)}B`
                    )}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">24h Trading Volume</dt>
                  <dd>
                    {isLoadingCoinData ? (
                      <Skeleton className="h-5 w-20 bg-white/10" />
                    ) : (
                      `$${((coinData?.market_data?.total_volume?.usd || 0) / 1000000000).toFixed(2)}B`
                    )}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">Coin Categories</dt>
                  <dd className="flex flex-wrap justify-end gap-1">
                    {isLoadingCoinData ? (
                      <Skeleton className="h-5 w-24 bg-white/10" />
                    ) : (
                      coinData?.categories?.slice(0, 3).map((category, index) => (
                        <Badge key={index} className="bg-accent/30 text-white">{category}</Badge>
                      ))
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Community Trust Score</h3>
            <div className="flex items-center gap-2">
              <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                {!isLoadingCoinData && (
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-green-500" 
                    style={{ width: `${85}%` }}
                  />
                )}
              </div>
              <span className="text-sm font-medium">
                {isLoadingCoinData ? (
                  <Skeleton className="h-5 w-12 bg-white/10" />
                ) : (
                  "85/100"
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle>Top Cryptocurrencies</CardTitle>
          <CardDescription className="text-white/70">
            By market capitalization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white">#</TableHead>
                <TableHead className="text-white">Coin</TableHead>
                <TableHead className="text-white text-right">Price</TableHead>
                <TableHead className="text-white text-right">24h</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTopCoins ? (
                Array(8).fill(0).map((_, index) => (
                  <TableRow key={index} className="border-white/10">
                    <TableCell><Skeleton className="h-5 w-5 bg-white/10" /></TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 bg-white/10 mb-1" />
                      <Skeleton className="h-4 w-10 bg-white/10" />
                    </TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto bg-white/10" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto bg-white/10" /></TableCell>
                  </TableRow>
                ))
              ) : (
                topCoins?.slice(0, 8).map((coin, index) => (
                  <TableRow 
                    key={coin.id} 
                    className={`border-white/10 ${coin.id === coinId ? "bg-accent/20" : ""}`}
                  >
                    <TableCell>{coin.market_cap_rank}</TableCell>
                    <TableCell>
                      <div className="font-medium">{coin.name}</div>
                      <div className="text-xs text-white/70">{coin.symbol.toUpperCase()}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${coin.current_price < 10 ? coin.current_price.toFixed(2) : coin.current_price.toLocaleString()}
                    </TableCell>
                    <TableCell className={`text-right ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white lg:col-span-3">
        <CardHeader>
          <CardTitle>Historical Price Chart</CardTitle>
          <CardDescription className="text-white/70">
            Price performance over different time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            {isLoadingCoinData ? (
              <div className="w-full h-full bg-white/5 rounded-lg animate-pulse" />
            ) : (
              <div className="text-white/50 text-sm">
                Historical price chart data would be displayed here using CoinGecko's historical data API.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinGeckoData;
