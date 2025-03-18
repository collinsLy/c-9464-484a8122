
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Globe, Twitter, MessageSquare, TrendingUp } from "lucide-react";

const MarketNews = () => {
  // Sample market news data - in a real app, this would come from APIs
  const newsItems = [
    {
      id: 1,
      title: "Bitcoin ETFs See Record Inflows as Price Consolidates Above $65K",
      source: "CoinDesk",
      category: "Bitcoin",
      time: "2 hours ago",
      url: "#",
      sentiment: "bullish"
    },
    {
      id: 2,
      title: "Ethereum Layer 2 Solutions Continue to Gain Traction as Gas Fees Remain High",
      source: "CryptoSlate",
      category: "Ethereum",
      time: "4 hours ago",
      url: "#",
      sentiment: "bullish"
    },
    {
      id: 3,
      title: "Solana's DeFi Ecosystem Surpasses $10 Billion in Total Value Locked",
      source: "The Block",
      category: "Solana",
      time: "6 hours ago",
      url: "#",
      sentiment: "bullish"
    },
    {
      id: 4,
      title: "Regulatory Concerns Grow as SEC Chair Calls for More Crypto Oversight",
      source: "Bloomberg",
      category: "Regulation",
      time: "8 hours ago",
      url: "#",
      sentiment: "bearish"
    },
    {
      id: 5,
      title: "Central Bank Digital Currencies: Countries Race to Develop Their Own Digital Assets",
      source: "Reuters",
      category: "CBDC",
      time: "12 hours ago",
      url: "#",
      sentiment: "neutral"
    },
  ];
  
  // Sample economic events
  const economicEvents = [
    {
      id: 1,
      event: "Fed Interest Rate Decision",
      date: "June 12, 2024",
      time: "2:00 PM ET",
      importance: "high",
      forecast: "No change expected"
    },
    {
      id: 2,
      event: "US CPI Data Release",
      date: "June 14, 2024",
      time: "8:30 AM ET",
      importance: "high",
      forecast: "5.2% year-over-year"
    },
    {
      id: 3,
      event: "ECB Monetary Policy Meeting",
      date: "June 18, 2024",
      time: "7:45 AM ET",
      importance: "medium",
      forecast: "Potential rate cut"
    },
    {
      id: 4,
      event: "US Jobless Claims",
      date: "June 20, 2024",
      time: "8:30 AM ET",
      importance: "medium",
      forecast: "210K"
    },
  ];
  
  // Sample social trends
  const socialTrends = [
    { tag: "#Bitcoin", count: 245800, change: 12 },
    { tag: "#Ethereum", count: 134500, change: 8 },
    { tag: "#Solana", count: 87600, change: 15 },
    { tag: "#Crypto", count: 324900, change: 5 },
    { tag: "#NFT", count: 56300, change: -3 },
    { tag: "#DeFi", count: 43200, change: 7 },
  ];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Latest Market News</CardTitle>
            <CardDescription className="text-white/70">
              Updates from across the crypto ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {newsItems.map((item) => (
                <div key={item.id} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <h3 className="text-base font-medium mb-2">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={
                        item.sentiment === "bullish" ? "bg-green-500/20 text-green-400" : 
                        item.sentiment === "bearish" ? "bg-red-500/20 text-red-400" : 
                        "bg-white/20 text-white"
                      }>
                        {item.category}
                      </Badge>
                      <span className="text-xs text-white/70">{item.source}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">
              <Globe className="w-4 h-4 mr-2" />
              View All News
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Economic Calendar</CardTitle>
            <CardDescription className="text-white/70">
              Upcoming market-moving events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {economicEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <div className="bg-background/60 p-2 rounded-md">
                    <Calendar className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium">{event.event}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="text-xs text-white/70">{event.date}</span>
                      <span className="text-xs text-white/70">{event.time}</span>
                      <Badge className={
                        event.importance === "high" ? "bg-red-500/20 text-red-400" : 
                        event.importance === "medium" ? "bg-amber-500/20 text-amber-400" : 
                        "bg-green-500/20 text-green-400"
                      }>
                        {event.importance.charAt(0).toUpperCase() + event.importance.slice(1)} Impact
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-white/70">Forecast:</span> {event.forecast}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Social Sentiment</CardTitle>
            <CardDescription className="text-white/70">
              Trending topics in the crypto space
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {socialTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                    <span className="font-medium">{trend.tag}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{(trend.count / 1000).toFixed(1)}K</span>
                    <span className={trend.change >= 0 ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
                      {trend.change >= 0 ? "+" : ""}{trend.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="flex-1 text-white border-white/20 hover:bg-white/10">
              <Twitter className="w-4 h-4 mr-2" />
              X / Twitter
            </Button>
            <Button variant="outline" className="flex-1 text-white border-white/20 hover:bg-white/10 ml-2">
              <MessageSquare className="w-4 h-4 mr-2" />
              Discord
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Market Sentiment</CardTitle>
            <CardDescription className="text-white/70">
              Current market mood indicator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-36 h-36 bg-background/60 rounded-full flex items-center justify-center mb-4">
                <div className="absolute inset-2 bg-gradient-to-r from-green-500 to-green-300 rounded-full opacity-20"></div>
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto text-green-400 mb-2" />
                  <div className="text-xl font-bold text-green-400">Bullish</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm mb-1">Fear & Greed Index</div>
                <div className="text-3xl font-bold">75</div>
                <div className="text-green-400 text-sm">Greed</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500" style={{ width: "75%" }} />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>Fear</span>
                <span>Neutral</span>
                <span>Greed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketNews;
