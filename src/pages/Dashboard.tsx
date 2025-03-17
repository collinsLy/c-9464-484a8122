import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { LogOut, Settings, Wallet, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import TradingViewChart from "@/components/TradingViewChart";

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  
  // Mock data
  const assets = [
    { id: 1, name: "Bitcoin", symbol: "BTC", balance: 0.45, value: 26532.12, change: 2.34 },
    { id: 2, name: "Ethereum", symbol: "ETH", balance: 3.21, value: 9432.76, change: -1.24 },
    { id: 3, name: "Solana", symbol: "SOL", balance: 28.5, value: 1843.20, change: 5.67 },
    { id: 4, name: "Cardano", symbol: "ADA", balance: 1240, value: 992.00, change: 0.12 },
  ];
  
  const transactions = [
    { id: 1, type: "Buy", asset: "Bitcoin", amount: 0.12, price: 27300, total: 3276, date: "2023-11-01" },
    { id: 2, type: "Sell", asset: "Ethereum", amount: 1.5, price: 1850, total: 2775, date: "2023-10-28" },
    { id: 3, type: "Buy", asset: "Solana", amount: 10, price: 35.2, total: 352, date: "2023-10-25" },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-white">Vertex Trading</div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* User Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-white/70">Total Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$38,800.08</div>
                <div className="flex items-center mt-1 text-sm">
                  <ArrowUpRight className="w-4 h-4 mr-1 text-green-400" />
                  <span className="text-green-400">+3.24%</span>
                  <span className="ml-1 text-white/60">today</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-white/70">Available Cash</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$5,230.45</div>
                <div className="flex mt-2">
                  <Button variant="outline" size="sm" className="mr-2 text-white border-white/20 hover:bg-white/10">
                    <Wallet className="w-4 h-4 mr-1" />
                    Deposit
                  </Button>
                  <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                    <CreditCard className="w-4 h-4 mr-1" />
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-white/70">Profit / Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">+$1,245.32</div>
                <div className="flex items-center mt-1 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
                  <span className="text-green-400">+8.12%</span>
                  <span className="ml-1 text-white/60">all time</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Chart and Assets */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            <div className="xl:col-span-3">
              <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Market Chart</CardTitle>
                    <div className="flex space-x-2">
                      {["BTCUSD", "ETHUSD", "SOLUSD"].map((symbol) => (
                        <Button 
                          key={symbol}
                          variant={selectedSymbol === symbol ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSymbol(symbol)}
                          className={selectedSymbol === symbol 
                            ? "bg-accent text-white" 
                            : "text-white border-white/20 hover:bg-white/10"
                          }
                        >
                          {symbol}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <TradingViewChart 
                      symbol={selectedSymbol} 
                      theme="dark" 
                      height={400} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="xl:col-span-1">
              <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white h-full">
                <CardHeader>
                  <CardTitle>Your Assets</CardTitle>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="space-y-4">
                    {assets.map((asset) => (
                      <div 
                        key={asset.id} 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                            {asset.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-white/60">{asset.balance} {asset.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${asset.value.toLocaleString()}</div>
                          <div className={`text-sm flex items-center justify-end ${asset.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {asset.change > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {asset.change > 0 ? '+' : ''}{asset.change}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-white/10">
                      <TableCell className={tx.type === 'Buy' ? 'text-green-400' : 'text-red-400'}>
                        {tx.type}
                      </TableCell>
                      <TableCell>{tx.asset}</TableCell>
                      <TableCell>{tx.amount}</TableCell>
                      <TableCell>${tx.price.toLocaleString()}</TableCell>
                      <TableCell>${tx.total.toLocaleString()}</TableCell>
                      <TableCell>{tx.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
