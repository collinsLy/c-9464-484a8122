
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { CryptoTicker } from "@/components/CryptoTicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, User, BarChart2, Brain, Zap, Book, FileText, BadgeCheck, TrendingUp } from "lucide-react";
import { LivePriceTicker } from "@/components/markets/LivePriceTicker";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const sampleSuggestions = [
  "Analyze BTC price action for the next week",
  "What's your opinion on ETH right now?",
  "Help me create a risk management strategy",
  "What technical indicators should I use for spotting reversals?",
  "Explain how to set stop losses properly"
];

const sampleResponses = {
  "Analyze BTC price action for the next week": 
    `Based on current market conditions, BTC is showing bullish momentum with key resistance at $58,500. Multiple indicators suggest potential continuation:

1. The RSI is at 62, showing strength without being overbought
2. MACD is showing a bullish crossover on the daily timeframe
3. Volume profile indicates strong accumulation at $55-56k

My analysis suggests a likely test of $60k within the next 7 days, with support levels at $54,800 and $52,300.

Key catalysts to watch include next week's FOMC minutes and options expiry on Friday. Keep position sizes reasonable given the current market volatility.`,

  "What's your opinion on ETH right now?":
    `Ethereum is currently in a consolidation phase after its recent rally. Here's my technical assessment:

1. Price is trading within a symmetrical triangle on the daily chart
2. ETH/BTC ratio is holding steady around 0.053
3. Network activity has increased by 15% over the past week
4. ETH 2.0 staking continues to lock up supply (15.8M ETH staked)

From a fundamental perspective, Ethereum remains strong with growing developer activity and DeFi TVL recovery.

For trading, consider accumulating between $2,950-3,050 with stops below $2,800. Target the $3,400-3,500 range on a breakout.`,

  "Help me create a risk management strategy":
    `Here's a comprehensive risk management framework for your trading:

1. **Position Sizing**:
   - Never risk more than 1-2% of your capital per trade
   - Scale position sizes based on conviction and volatility
   - Consider Kelly Criterion for optimal sizing

2. **Stop Loss Strategy**:
   - Place stops at technical invalidation points, not arbitrary percentages
   - Consider ATR-based stops (2-3x ATR from entry)
   - Use tiered stops for partial exits

3. **Portfolio Allocation**:
   - Core holdings: 50-60% in blue-chip assets
   - Growth allocation: 20-30% in mid-caps
   - Speculative: 10-20% maximum in small-caps
   - Cash reserve: 10-15% for opportunities

4. **Drawdown Management**:
   - Reduce position sizes by 50% when portfolio is down 10%
   - Stop trading new positions after 15% drawdown
   - Consider monthly rebalancing

Would you like me to elaborate on any specific aspect of this plan?`
};

const AITradingAssistantPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI trading assistant. I can help with market analysis, trading strategies, and risk management. What would you like to know today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      let responseContent = "I'm analyzing your request. In a real implementation, this would connect to an AI service.";
      
      // Check if we have a canned response for this exact question
      if (sampleResponses[input]) {
        responseContent = sampleResponses[input];
      }
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // In a real implementation, you might want to immediately send the message too
  };
  
  const handleTradingStrategyGenerate = () => {
    toast.success("Trading strategy created! Check the Strategies tab to view it.");
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Trading Assistant</h1>
            <p className="text-sm text-white/70 mt-1">Your personal AI-powered trading analyst and advisor</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <CryptoTicker />
        
        <LivePriceTicker />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Trading Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
                          <Avatar className={`h-8 w-8 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                            <AvatarFallback>
                              {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div 
                            className={`rounded-lg px-4 py-2 ${
                              message.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-card text-card-foreground'
                            }`}
                          >
                            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex flex-row max-w-[80%]">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="rounded-lg px-4 py-2 bg-card text-card-foreground">
                            <div className="text-sm">Thinking...</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex items-center space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about market analysis, trading strategies, or risk management..."
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
                    Send
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {sampleSuggestions.map((suggestion, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Tabs defaultValue="analysis">
              <TabsList className="w-full bg-background/40 backdrop-blur-lg border-white/10 text-white">
                <TabsTrigger value="analysis" className="flex-1">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="strategies" className="flex-1">
                  <FileText className="h-4 w-4 mr-1" />
                  Strategies
                </TabsTrigger>
                <TabsTrigger value="learn" className="flex-1">
                  <Book className="h-4 w-4 mr-1" />
                  Learn
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis">
                <Card className="bg-background/40 backdrop-blur-lg border-white/10">
                  <CardHeader>
                    <CardTitle className="text-base">Market Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background/20 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                          BTC Sentiment Analysis
                        </div>
                        <span className="text-xs text-white/70">Updated 10m ago</span>
                      </div>
                      <div className="text-sm text-white/70">
                        Overall market sentiment is bullish with 78% positive mentions across social media and news.
                      </div>
                      <Button variant="link" size="sm" className="text-xs px-0">
                        View full report
                      </Button>
                    </div>
                    
                    <div className="bg-background/20 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium">Key Support/Resistance</div>
                        <span className="text-xs text-white/70">BTC/USDT</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-red-400">Resistance 3</span>
                          <span>$59,800</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-400">Resistance 2</span>
                          <span>$58,300</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-400">Resistance 1</span>
                          <span>$57,200</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white">Current Price</span>
                          <span>$56,450</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400">Support 1</span>
                          <span>$55,800</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400">Support 2</span>
                          <span>$54,200</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400">Support 3</span>
                          <span>$52,900</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-background/20 p-3 rounded-md">
                      <div className="font-medium mb-1">Fear & Greed Index</div>
                      <div className="h-6 w-full bg-black/40 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                          style={{ width: '100%' }}
                        />
                        <div 
                          className="absolute top-0 h-full w-1 bg-white"
                          style={{ left: '65%' }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>Extreme Fear</span>
                        <span className="font-medium">Greed (65)</span>
                        <span>Extreme Greed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="strategies">
                <Card className="bg-background/40 backdrop-blur-lg border-white/10">
                  <CardHeader>
                    <CardTitle className="text-base">Trading Strategies</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" onClick={handleTradingStrategyGenerate}>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Strategy
                    </Button>
                    
                    <div className="bg-background/20 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium flex items-center">
                          <BadgeCheck className="h-4 w-4 mr-1 text-blue-400" />
                          BTC Swing Trading
                        </div>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="text-sm text-white/70 mb-2">
                        4H timeframe strategy using EMA crossovers and RSI confirmation
                      </div>
                      <div className="text-xs text-white/50 flex justify-between">
                        <span>Win rate: 68%</span>
                        <span>Generated on May 12, 2023</span>
                      </div>
                    </div>
                    
                    <div className="bg-background/20 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium">ETH Breakout Strategy</div>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                          Backtesting
                        </span>
                      </div>
                      <div className="text-sm text-white/70 mb-2">
                        Daily chart strategy focused on volume-confirmed breakouts
                      </div>
                      <div className="text-xs text-white/50 flex justify-between">
                        <span>Backtest: +34.2%</span>
                        <span>Generated today</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="learn">
                <Card className="bg-background/40 backdrop-blur-lg border-white/10">
                  <CardHeader>
                    <CardTitle className="text-base">Learning Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background/20 p-3 rounded-md">
                      <div className="font-medium mb-1">AI Recommended Topics</div>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center">
                          <Book className="h-4 w-4 mr-2 text-primary" />
                          <span>Risk Management Fundamentals</span>
                        </li>
                        <li className="flex items-center">
                          <Book className="h-4 w-4 mr-2 text-primary" />
                          <span>Understanding Support & Resistance</span>
                        </li>
                        <li className="flex items-center">
                          <Book className="h-4 w-4 mr-2 text-primary" />
                          <span>Trading Psychology: Managing Emotions</span>
                        </li>
                        <li className="flex items-center">
                          <Book className="h-4 w-4 mr-2 text-primary" />
                          <span>Technical Analysis: Chart Patterns</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-background/20 p-3 rounded-md">
                      <div className="font-medium mb-1">Your Learning Progress</div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Beginner Course</span>
                            <span>76%</span>
                          </div>
                          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: '76%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Technical Analysis</span>
                            <span>43%</span>
                          </div>
                          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: '43%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Risk Management</span>
                            <span>12%</span>
                          </div>
                          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: '12%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AITradingAssistantPage;
