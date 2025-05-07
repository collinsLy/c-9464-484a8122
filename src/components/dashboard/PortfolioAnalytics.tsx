
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

// Import your chart component if available or use a charting library

const timeRanges = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '1y', value: '1y' },
  { label: 'All', value: 'all' },
];

// Dummy data - replace with real data in production
const portfolioData = {
  current: 12845.32,
  change: 1243.21,
  changePercent: 10.7,
  isPositive: true,
  allocation: [
    { name: 'Bitcoin', symbol: 'BTC', value: 5423.12, percent: 42, color: '#F7931A' },
    { name: 'Ethereum', symbol: 'ETH', value: 3241.54, percent: 25, color: '#627EEA' },
    { name: 'Solana', symbol: 'SOL', value: 1842.33, percent: 14, color: '#00FFA3' },
    { name: 'Worldcoin', symbol: 'WLD', value: 987.45, percent: 8, color: '#4B5563' },
    { name: 'Other', symbol: 'OTHER', value: 1350.88, percent: 11, color: '#9CA3AF' },
  ],
  performance: {
    '24h': {
      value: 1243.21,
      percent: 10.7,
      isPositive: true
    },
    '7d': {
      value: 1843.11,
      percent: 16.2,
      isPositive: true
    },
    '30d': {
      value: -245.65,
      percent: -1.9,
      isPositive: false
    },
    '1y': {
      value: 4582.34,
      percent: 52.4,
      isPositive: true
    },
    'all': {
      value: 7845.32,
      percent: 156.8,
      isPositive: true
    }
  }
};

export function PortfolioAnalytics() {
  const [timeRange, setTimeRange] = useState('24h');
  
  const renderPerformanceCard = (timeframe: string) => {
    const data = portfolioData.performance[timeframe as keyof typeof portfolioData.performance];
    
    return (
      <Card className="bg-background/40 backdrop-blur-lg border-white/10">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">{timeframe} Performance</h3>
            {data.isPositive ? 
              <TrendingUp className="w-5 h-5 text-green-500" /> : 
              <TrendingDown className="w-5 h-5 text-red-500" />
            }
          </div>
          <div className="text-3xl font-bold mb-2 text-white">
            ${Math.abs(data.value).toFixed(2)}
          </div>
          <div className={`flex items-center ${data.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {data.isPositive ? 
              <ArrowUpRight className="w-4 h-4 mr-1" /> : 
              <ArrowDownRight className="w-4 h-4 mr-1" />
            }
            <span>{data.isPositive ? '+' : '-'}{Math.abs(data.percent).toFixed(2)}%</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <CardTitle>Portfolio Analytics</CardTitle>
        <div className="flex justify-start">
          <TabsList className="bg-background/40 border-white/10 text-white">
            {timeRanges.map((range) => (
              <TabsTrigger 
                key={range.value}
                value={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`text-white ${timeRange === range.value ? 'bg-accent' : ''}`}
              >
                {range.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/70">Total Portfolio Value</p>
                <h2 className="text-3xl font-bold">${portfolioData.current.toFixed(2)}</h2>
                <div className={`flex items-center ${portfolioData.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {portfolioData.isPositive ? 
                    <ArrowUpRight className="w-4 h-4 mr-1" /> : 
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  }
                  <span>
                    {portfolioData.isPositive ? '+' : '-'}
                    ${Math.abs(portfolioData.change).toFixed(2)} 
                    ({Math.abs(portfolioData.changePercent).toFixed(2)}%)
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Asset Allocation</h3>
              <div className="space-y-3">
                {portfolioData.allocation.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }}></div>
                      <span>{asset.name} ({asset.symbol})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white/70">{asset.percent}%</span>
                      <span>${asset.value.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-center h-56">
              <div className="w-36 h-36 rounded-full border-8 border-accent/30 flex items-center justify-center relative">
                <PieChart className="w-12 h-12 text-white/70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full" style={{ 
                    background: `conic-gradient(
                      ${portfolioData.allocation[0].color} 0% ${portfolioData.allocation[0].percent}%, 
                      ${portfolioData.allocation[1].color} ${portfolioData.allocation[0].percent}% ${portfolioData.allocation[0].percent + portfolioData.allocation[1].percent}%,
                      ${portfolioData.allocation[2].color} ${portfolioData.allocation[0].percent + portfolioData.allocation[1].percent}% ${portfolioData.allocation[0].percent + portfolioData.allocation[1].percent + portfolioData.allocation[2].percent}%,
                      ${portfolioData.allocation[3].color} ${portfolioData.allocation[0].percent + portfolioData.allocation[1].percent + portfolioData.allocation[2].percent}% ${portfolioData.allocation[0].percent + portfolioData.allocation[1].percent + portfolioData.allocation[2].percent + portfolioData.allocation[3].percent}%,
                      ${portfolioData.allocation[4].color} ${portfolioData.allocation[0].percent + portfolioData.allocation[1].percent + portfolioData.allocation[2].percent + portfolioData.allocation[3].percent}% 100%
                    )` 
                  }} className="rounded-full">
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {renderPerformanceCard(timeRange)}
              <Card className="bg-background/40 backdrop-blur-lg border-white/10">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Total Assets</h3>
                    <PieChart className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="text-3xl font-bold mb-2 text-white">
                    {portfolioData.allocation.length}
                  </div>
                  <div className="text-white/70">
                    Diversified Portfolio
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
