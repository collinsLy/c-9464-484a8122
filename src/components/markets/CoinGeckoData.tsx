
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CoinGeckoDataProps {
  symbol: string;
}

const CoinGeckoData = ({ symbol }: CoinGeckoDataProps) => {
  const symbolName = symbol.slice(0, 3);
  
  // Sample data - in a real app, this would come from CoinGecko API
  const marketData = {
    name: symbolName === "BTC" ? "Bitcoin" : 
          symbolName === "ETH" ? "Ethereum" : 
          symbolName === "SOL" ? "Solana" :
          symbolName === "BNB" ? "Binance Coin" :
          symbolName === "ADA" ? "Cardano" :
          symbolName === "DOT" ? "Polkadot" : symbolName,
    rank: symbolName === "BTC" ? 1 : 
          symbolName === "ETH" ? 2 : 
          symbolName === "SOL" ? 5 :
          symbolName === "BNB" ? 4 :
          symbolName === "ADA" ? 8 :
          symbolName === "DOT" ? 12 : 0,
    price: symbolName === "BTC" ? 65432.21 : 
           symbolName === "ETH" ? 3245.67 : 
           symbolName === "SOL" ? 152.43 :
           symbolName === "BNB" ? 605.78 :
           symbolName === "ADA" ? 0.59 :
           symbolName === "DOT" ? 8.72 : 0,
    marketCap: symbolName === "BTC" ? 1273000000000 : 
               symbolName === "ETH" ? 389000000000 : 
               symbolName === "SOL" ? 62100000000 :
               symbolName === "BNB" ? 92400000000 :
               symbolName === "ADA" ? 19800000000 :
               symbolName === "DOT" ? 10700000000 : 0,
    volume24h: symbolName === "BTC" ? 32500000000 : 
               symbolName === "ETH" ? 24800000000 : 
               symbolName === "SOL" ? 18200000000 :
               symbolName === "BNB" ? 15400000000 :
               symbolName === "ADA" ? 12100000000 :
               symbolName === "DOT" ? 8700000000 : 0,
    change24h: symbolName === "BTC" ? 2.3 : 
               symbolName === "ETH" ? 1.7 : 
               symbolName === "SOL" ? 3.5 :
               symbolName === "BNB" ? -0.8 :
               symbolName === "ADA" ? -2.1 :
               symbolName === "DOT" ? 1.2 : 0,
    allTimeHigh: symbolName === "BTC" ? 69044.77 : 
                 symbolName === "ETH" ? 4878.26 : 
                 symbolName === "SOL" ? 259.96 :
                 symbolName === "BNB" ? 686.31 :
                 symbolName === "ADA" ? 3.10 :
                 symbolName === "DOT" ? 55.00 : 0,
    allTimeHighDate: "2021-11-10",
    trustScore: symbolName === "BTC" ? 93 : 
                symbolName === "ETH" ? 90 : 
                symbolName === "SOL" ? 85 :
                symbolName === "BNB" ? 82 :
                symbolName === "ADA" ? 88 :
                symbolName === "DOT" ? 86 : 0,
    categories: symbolName === "BTC" ? ["Currency", "Store of Value"] : 
                symbolName === "ETH" ? ["Smart Contract Platform", "DeFi"] : 
                symbolName === "SOL" ? ["Smart Contract Platform", "Web3"] :
                symbolName === "BNB" ? ["Centralized Exchange", "Smart Contract Platform"] :
                symbolName === "ADA" ? ["Smart Contract Platform", "Research"] :
                symbolName === "DOT" ? ["Interoperability", "Substrate"] : [],
  };
  
  // Top cryptocurrencies by market cap
  const topCoins = [
    { rank: 1, name: "Bitcoin", symbol: "BTC", price: 65432.21, marketCap: 1273000000000, change24h: 2.3 },
    { rank: 2, name: "Ethereum", symbol: "ETH", price: 3245.67, marketCap: 389000000000, change24h: 1.7 },
    { rank: 3, name: "Tether", symbol: "USDT", price: 1.00, marketCap: 106000000000, change24h: 0.01 },
    { rank: 4, name: "Binance Coin", symbol: "BNB", price: 605.78, marketCap: 92400000000, change24h: -0.8 },
    { rank: 5, name: "Solana", symbol: "SOL", price: 152.43, marketCap: 62100000000, change24h: 3.5 },
    { rank: 6, name: "XRP", symbol: "XRP", price: 0.62, marketCap: 33700000000, change24h: -1.2 },
    { rank: 7, name: "USDC", symbol: "USDC", price: 1.00, marketCap: 32300000000, change24h: 0.01 },
    { rank: 8, name: "Cardano", symbol: "ADA", price: 0.59, marketCap: 19800000000, change24h: -2.1 },
  ];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white lg:col-span-2">
        <CardHeader>
          <CardTitle>{marketData.name} Market Data</CardTitle>
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
                  <dd className="font-medium">${marketData.price.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">24h Change</dt>
                  <dd className={marketData.change24h >= 0 ? "text-green-400" : "text-red-400"}>
                    {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h}%
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">All-Time High</dt>
                  <dd className="font-medium">${marketData.allTimeHigh.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">ATH Date</dt>
                  <dd>{marketData.allTimeHighDate}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Market Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">Market Cap Rank</dt>
                  <dd>#{marketData.rank}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">Market Cap</dt>
                  <dd>${(marketData.marketCap / 1000000000).toFixed(2)}B</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">24h Trading Volume</dt>
                  <dd>${(marketData.volume24h / 1000000000).toFixed(2)}B</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <dt className="text-white/70">Coin Categories</dt>
                  <dd className="flex flex-wrap justify-end gap-1">
                    {marketData.categories.map((category, index) => (
                      <Badge key={index} className="bg-accent/30 text-white">{category}</Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Community Trust Score</h3>
            <div className="flex items-center gap-2">
              <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-green-500" 
                  style={{ width: `${marketData.trustScore}%` }}
                />
              </div>
              <span className="text-sm font-medium">{marketData.trustScore}/100</span>
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
              {topCoins.map((coin) => (
                <TableRow 
                  key={coin.symbol} 
                  className={`border-white/10 ${coin.symbol === symbolName ? "bg-accent/20" : ""}`}
                >
                  <TableCell>{coin.rank}</TableCell>
                  <TableCell>
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-xs text-white/70">{coin.symbol}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    ${coin.price < 10 ? coin.price.toFixed(2) : coin.price.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right ${coin.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                  </TableCell>
                </TableRow>
              ))}
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
            <div className="text-white/50 text-sm">
              In a real implementation, this would show a historical price chart from CoinGecko API.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinGeckoData;
