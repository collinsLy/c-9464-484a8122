
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import TradingViewChart from "@/components/TradingViewChart";
import { CryptoTicker } from "@/components/CryptoTicker";
import { AlertCircle, TrendingUp, Zap, Code, Copy, Play, ArrowUpRight, FileText, Gauge, BookOpen, Save, Share2 } from "lucide-react";
import { toast } from "sonner";

const StrategyTradingPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [selectedTab, setSelectedTab] = useState("builder");
  const [selectedIndicator, setSelectedIndicator] = useState("RSI");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [strategyName, setStrategyName] = useState("My Strategy");
  const [backTestProgress, setBackTestProgress] = useState(0);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [backtestResults, setBacktestResults] = useState(null);
  const [leverageValue, setLeverageValue] = useState([5]);

  const indicators = [
    { name: "RSI", description: "Relative Strength Index" },
    { name: "MACD", description: "Moving Average Convergence Divergence" },
    { name: "Bollinger Bands", description: "Volatility indicator" },
    { name: "Moving Average", description: "Simple/Exponential moving average" },
    { name: "Stochastic", description: "Stochastic oscillator" }
  ];

  const timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"];

  const strategies = [
    { name: "RSI Cross Strategy", author: "TradingMaster", performance: "+18.5%" },
    { name: "Golden Cross", author: "CryptoWhale", performance: "+22.1%" },
    { name: "Bollinger Squeeze", author: "TechAnalyst", performance: "+15.7%" },
    { name: "MACD Momentum", author: "AlgoTrader", performance: "+31.2%" }
  ];

  const runBacktest = () => {
    setIsBacktesting(true);
    setBackTestProgress(0);
    
    const interval = setInterval(() => {
      setBackTestProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBacktesting(false);
          
          // Mock backtest results
          setBacktestResults({
            totalTrades: 128,
            winRate: 68.7,
            profitFactor: 1.92,
            sharpeRatio: 1.65,
            maxDrawdown: 15.3,
            netProfit: 42.8,
            averageTrade: 0.33
          });
          
          toast.success("Backtest completed", {
            description: "Strategy backtest has been successfully completed."
          });
          
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const deployStrategy = () => {
    toast.success("Strategy deployed", {
      description: "Your strategy is now live and trading."
    });
  };

  const saveStrategy = () => {
    toast.success("Strategy saved", {
      description: "Your strategy has been saved successfully."
    });
  };

  const copyStrategy = (strategy) => {
    toast.success(`Strategy copied`, {
      description: `${strategy.name} has been added to your strategies.`
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Strategy Trading</h1>
            <p className="text-sm text-white/70 mt-1">Create, backtest, and deploy trading strategies</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <CryptoTicker />

        <div className="grid gap-4 grid-cols-1">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-4">
              <TabsTrigger value="builder" className="text-white data-[state=active]:bg-accent">
                <Code className="h-4 w-4 mr-2" />
                Strategy Builder
              </TabsTrigger>
              <TabsTrigger value="backtest" className="text-white data-[state=active]:bg-accent">
                <FileText className="h-4 w-4 mr-2" />
                Backtest
              </TabsTrigger>
              <TabsTrigger value="deployed" className="text-white data-[state=active]:bg-accent">
                <Play className="h-4 w-4 mr-2" />
                Deployed
              </TabsTrigger>
              <TabsTrigger value="library" className="text-white data-[state=active]:bg-accent">
                <BookOpen className="h-4 w-4 mr-2" />
                Strategy Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                    <CardHeader>
                      <CardTitle>Chart Analysis</CardTitle>
                      <CardDescription className="text-white/70">Visualize and test your strategies</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                          <SelectTrigger className="w-32 bg-background/40 border-white/10">
                            <SelectValue placeholder="Symbol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BTCUSD">BTC/USD</SelectItem>
                            <SelectItem value="ETHUSD">ETH/USD</SelectItem>
                            <SelectItem value="SOLUSD">SOL/USD</SelectItem>
                            <SelectItem value="BNBUSD">BNB/USD</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                          <SelectTrigger className="w-32 bg-background/40 border-white/10">
                            <SelectValue placeholder="Timeframe" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeframes.map(timeframe => (
                              <SelectItem key={timeframe} value={timeframe}>{timeframe}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="h-[400px] rounded-md bg-background/30 overflow-hidden">
                        <TradingViewChart symbol={selectedSymbol} timeframe={selectedTimeframe} containerId="strategy_chart" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle>Strategy Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="strategyName">Strategy Name</Label>
                          <Input 
                            id="strategyName"
                            placeholder="Enter strategy name" 
                            value={strategyName}
                            onChange={(e) => setStrategyName(e.target.value)}
                            className="bg-background/40 border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Base Indicator</Label>
                          <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select indicator" />
                            </SelectTrigger>
                            <SelectContent>
                              {indicators.map(indicator => (
                                <SelectItem key={indicator.name} value={indicator.name}>{indicator.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedIndicator === "RSI" && (
                          <div className="space-y-2">
                            <Label>RSI Period</Label>
                            <Select defaultValue="14">
                              <SelectTrigger className="bg-background/40 border-white/10">
                                <SelectValue placeholder="Select period" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7</SelectItem>
                                <SelectItem value="14">14</SelectItem>
                                <SelectItem value="21">21</SelectItem>
                                <SelectItem value="28">28</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Entry Condition</Label>
                          <Select defaultValue="cross-above">
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cross-above">Cross Above</SelectItem>
                              <SelectItem value="cross-below">Cross Below</SelectItem>
                              <SelectItem value="above">Above Value</SelectItem>
                              <SelectItem value="below">Below Value</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Exit Condition</Label>
                          <Select defaultValue="take-profit">
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="take-profit">Take Profit</SelectItem>
                              <SelectItem value="stop-loss">Stop Loss</SelectItem>
                              <SelectItem value="indicator-reversal">Indicator Reversal</SelectItem>
                              <SelectItem value="time-based">Time-Based</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Take Profit (%)</Label>
                          <Input 
                            type="number" 
                            defaultValue="3.5" 
                            className="bg-background/40 border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Stop Loss (%)</Label>
                          <Input 
                            type="number" 
                            defaultValue="2.0" 
                            className="bg-background/40 border-white/10"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4">
                        <Button className="w-full" onClick={saveStrategy}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Strategy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="backtest">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                    <CardHeader>
                      <CardTitle>Backtest Chart</CardTitle>
                      <CardDescription className="text-white/70">Analyze performance on historical data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                            <SelectTrigger className="w-32 bg-background/40 border-white/10">
                              <SelectValue placeholder="Symbol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BTCUSD">BTC/USD</SelectItem>
                              <SelectItem value="ETHUSD">ETH/USD</SelectItem>
                              <SelectItem value="SOLUSD">SOL/USD</SelectItem>
                              <SelectItem value="BNBUSD">BNB/USD</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                            <SelectTrigger className="w-32 bg-background/40 border-white/10">
                              <SelectValue placeholder="Timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeframes.map(timeframe => (
                                <SelectItem key={timeframe} value={timeframe}>{timeframe}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Select defaultValue="3m">
                          <SelectTrigger className="w-32 bg-background/40 border-white/10">
                            <SelectValue placeholder="Period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1m">1 Month</SelectItem>
                            <SelectItem value="3m">3 Months</SelectItem>
                            <SelectItem value="6m">6 Months</SelectItem>
                            <SelectItem value="1y">1 Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="h-[400px] rounded-md bg-background/30 overflow-hidden">
                        <TradingViewChart symbol={selectedSymbol} timeframe={selectedTimeframe} containerId="backtest_chart" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle>Backtest Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="leverage">Leverage</Label>
                            <span className="text-white/70">{leverageValue}x</span>
                          </div>
                          <Slider 
                            id="leverage"
                            min={1} 
                            max={20} 
                            step={1} 
                            defaultValue={[5]} 
                            onValueChange={setLeverageValue}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Initial Capital</Label>
                          <Input 
                            type="number" 
                            defaultValue="10000" 
                            className="bg-background/40 border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Position Size (%)</Label>
                          <Input 
                            type="number" 
                            defaultValue="10" 
                            className="bg-background/40 border-white/10"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="slippage">Include Slippage</Label>
                          <Switch id="slippage" defaultChecked />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="fees">Include Fees</Label>
                          <Switch id="fees" defaultChecked />
                        </div>

                        <Button 
                          className="w-full" 
                          onClick={runBacktest}
                          disabled={isBacktesting}
                        >
                          {isBacktesting ? "Processing..." : "Run Backtest"}
                        </Button>

                        {isBacktesting && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Processing backtest data...</span>
                              <span>{backTestProgress}%</span>
                            </div>
                            <Progress value={backTestProgress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {backtestResults && (
                    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                      <CardHeader className="pb-2">
                        <CardTitle>Backtest Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center pb-1 border-b border-white/10">
                            <span className="text-white/70">Total Trades</span>
                            <span className="font-medium">{backtestResults.totalTrades}</span>
                          </div>
                          <div className="flex justify-between items-center pb-1 border-b border-white/10">
                            <span className="text-white/70">Win Rate</span>
                            <span className="font-medium text-green-400">{backtestResults.winRate}%</span>
                          </div>
                          <div className="flex justify-between items-center pb-1 border-b border-white/10">
                            <span className="text-white/70">Profit Factor</span>
                            <span className="font-medium">{backtestResults.profitFactor}</span>
                          </div>
                          <div className="flex justify-between items-center pb-1 border-b border-white/10">
                            <span className="text-white/70">Sharpe Ratio</span>
                            <span className="font-medium">{backtestResults.sharpeRatio}</span>
                          </div>
                          <div className="flex justify-between items-center pb-1 border-b border-white/10">
                            <span className="text-white/70">Max Drawdown</span>
                            <span className="font-medium text-red-400">-{backtestResults.maxDrawdown}%</span>
                          </div>
                          <div className="flex justify-between items-center pb-1 border-b border-white/10">
                            <span className="text-white/70">Net Profit</span>
                            <span className="font-medium text-green-400">+{backtestResults.netProfit}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/70">Avg. Trade</span>
                            <span className="font-medium text-green-400">+{backtestResults.averageTrade}%</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button className="flex-1" onClick={deployStrategy}>
                            <Play className="h-4 w-4 mr-2" />
                            Deploy
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Share2 className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deployed">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                    <CardHeader>
                      <CardTitle>Strategy Performance</CardTitle>
                      <CardDescription className="text-white/70">Live performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] rounded-md bg-background/30 flex items-center justify-center">
                        <div className="text-center text-white/60">
                          <AlertCircle className="h-16 w-16 mx-auto mb-2 opacity-50" />
                          <p>No active strategies deployed</p>
                          <p className="text-sm mt-2">Deploy a strategy from the backtest page</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">0</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-400">+0.00%</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-400">+0.00%</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle>Deploy New Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Strategy</Label>
                          <Select defaultValue="">
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select a strategy" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rsi-cross">RSI Cross Strategy</SelectItem>
                              <SelectItem value="golden-cross">Golden Cross</SelectItem>
                              <SelectItem value="bollinger-squeeze">Bollinger Squeeze</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Market</Label>
                          <Select defaultValue="BTCUSD">
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select market" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BTCUSD">BTC/USD</SelectItem>
                              <SelectItem value="ETHUSD">ETH/USD</SelectItem>
                              <SelectItem value="SOLUSD">SOL/USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Timeframe</Label>
                          <Select defaultValue="1h">
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeframes.map(timeframe => (
                                <SelectItem key={timeframe} value={timeframe}>{timeframe}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Capital Allocation ($)</Label>
                          <Input 
                            type="number" 
                            defaultValue="1000" 
                            className="bg-background/40 border-white/10"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="auto-compound">Auto-Compound Profits</Label>
                          <Switch id="auto-compound" />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="notifications">Trade Notifications</Label>
                          <Switch id="notifications" defaultChecked />
                        </div>

                        <Button 
                          className="w-full"
                          disabled={isDemoMode}
                          onClick={() => {
                            if (isDemoMode) {
                              toast.error("Not available in demo mode");
                            } else {
                              toast.success("Strategy deployment initiated");
                            }
                          }}
                        >
                          {isDemoMode ? "Demo Mode (Disabled)" : "Deploy Strategy"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="library">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Top Performing Strategies</CardTitle>
                        <CardDescription className="text-white/70">Copy strategies from top traders</CardDescription>
                      </div>
                      <Select defaultValue="month">
                        <SelectTrigger className="w-32 bg-background/40 border-white/10">
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                          <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {strategies.map((strategy, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium">{strategy.name}</div>
                                <div className="text-sm text-white/70">by {strategy.author}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-green-400 font-medium">{strategy.performance}</div>
                              <Button variant="outline" size="sm" onClick={() => copyStrategy(strategy)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle>Strategy Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Market Type</Label>
                          <Select defaultValue="crypto">
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select market type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="crypto">Crypto</SelectItem>
                              <SelectItem value="forex">Forex</SelectItem>
                              <SelectItem value="stocks">Stocks</SelectItem>
                              <SelectItem value="commodities">Commodities</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Strategy Type</Label>
                          <Select defaultValue="trend">
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select strategy type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trend">Trend Following</SelectItem>
                              <SelectItem value="reversal">Reversal</SelectItem>
                              <SelectItem value="breakout">Breakout</SelectItem>
                              <SelectItem value="scalping">Scalping</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Minimum Win Rate</Label>
                          <Select defaultValue="60">
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select minimum" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="50">Above 50%</SelectItem>
                              <SelectItem value="60">Above 60%</SelectItem>
                              <SelectItem value="70">Above 70%</SelectItem>
                              <SelectItem value="80">Above 80%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Timeframe</Label>
                          <Select defaultValue="all">
                            <SelectTrigger className="bg-background/40 border-white/10">
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="short">Short Term</SelectItem>
                              <SelectItem value="medium">Medium Term</SelectItem>
                              <SelectItem value="long">Long Term</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="verified">Verified Strategies Only</Label>
                          <Switch id="verified" defaultChecked />
                        </div>

                        <Button variant="outline" className="w-full">
                          Apply Filters
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle>Strategy Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-1 border-b border-white/10">
                          <span className="text-white/70">Total Strategies</span>
                          <span className="font-medium">148</span>
                        </div>
                        <div className="flex justify-between items-center pb-1 border-b border-white/10">
                          <span className="text-white/70">Most Popular</span>
                          <span className="font-medium">RSI Cross</span>
                        </div>
                        <div className="flex justify-between items-center pb-1 border-b border-white/10">
                          <span className="text-white/70">Highest Win Rate</span>
                          <span className="font-medium text-green-400">84.6%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Best Return</span>
                          <span className="font-medium text-green-400">+87.3%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StrategyTradingPage;
