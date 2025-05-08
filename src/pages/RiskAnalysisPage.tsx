
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoTicker } from "@/components/CryptoTicker";
import { LivePriceTicker } from "@/components/markets/LivePriceTicker";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#2c3e50', '#3498db', '#2ecc71'];

const RiskAnalysisPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [riskMetric, setRiskMetric] = useState("concentration");
  
  // Sample portfolio data - would be fetched from user's actual holdings
  const portfolioData = [
    { name: 'BTC', value: 45, volatility: 75, drawdown: 55 },
    { name: 'ETH', value: 25, volatility: 82, drawdown: 62 },
    { name: 'SOL', value: 15, volatility: 90, drawdown: 70 },
    { name: 'USDT', value: 10, volatility: 10, drawdown: 5 },
    { name: 'ADA', value: 5, volatility: 68, drawdown: 58 },
  ];
  
  // Sample correlation data between assets (would be calculated from historical prices)
  const correlationData = [
    { pair: 'BTC-ETH', value: 0.85 },
    { pair: 'BTC-SOL', value: 0.72 },
    { pair: 'BTC-ADA', value: 0.68 },
    { pair: 'ETH-SOL', value: 0.78 },
    { pair: 'ETH-ADA', value: 0.65 },
    { pair: 'SOL-ADA', value: 0.62 },
  ];
  
  const riskScores = {
    concentration: 76,
    volatility: 82,
    correlation: 68,
    overall: 75
  };
  
  const getColorByRisk = (score) => {
    if (score < 40) return '#10b981'; // Low risk - green
    if (score < 70) return '#f59e0b'; // Medium risk - yellow/orange
    return '#ef4444'; // High risk - red
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Portfolio Risk Analysis</h1>
            <p className="text-sm text-white/70 mt-1">Understand and optimize your portfolio risk exposure</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <CryptoTicker />
        
        <LivePriceTicker />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold" style={{ color: getColorByRisk(riskScores.overall) }}>{riskScores.overall}%</div>
                <div className="text-white/70">Overall Risk</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold" style={{ color: getColorByRisk(riskScores.concentration) }}>{riskScores.concentration}%</div>
                <div className="text-white/70">Concentration Risk</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold" style={{ color: getColorByRisk(riskScores.volatility) }}>{riskScores.volatility}%</div>
                <div className="text-white/70">Volatility Exposure</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold" style={{ color: getColorByRisk(riskScores.correlation) }}>{riskScores.correlation}%</div>
                <div className="text-white/70">Correlation Risk</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="concentration" className="w-full" onValueChange={setRiskMetric}>
          <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
            <TabsTrigger value="concentration">Asset Concentration</TabsTrigger>
            <TabsTrigger value="volatility">Volatility Analysis</TabsTrigger>
            <TabsTrigger value="correlation">Correlation Matrix</TabsTrigger>
            <TabsTrigger value="optimization">Portfolio Optimization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="concentration">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle>Asset Concentration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {portfolioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-white/70">
                  <p>Your portfolio shows a high concentration in Bitcoin (45%). Consider diversifying to reduce risk.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="volatility">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle>Asset Volatility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={portfolioData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="volatility" name="Volatility Score" fill="#8884d8" />
                      <Bar dataKey="drawdown" name="Max Drawdown %" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-white/70">
                  <p>Solana (SOL) shows the highest volatility in your portfolio. Consider hedging or adjusting position size.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="correlation">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle>Asset Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={correlationData} layout="vertical">
                      <XAxis type="number" domain={[0, 1]} />
                      <YAxis dataKey="pair" type="category" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-white/70">
                  <p>BTC and ETH show high correlation (0.85). Consider adding uncorrelated assets for better diversification.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="optimization">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle>Portfolio Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background/20 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Recommended Allocations</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>BTC</span>
                        <span>35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ETH</span>
                        <span>25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SOL</span>
                        <span>10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>USDT</span>
                        <span>20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ADA</span>
                        <span>5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DOT</span>
                        <span>5%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background/20 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Optimization Strategy</h3>
                    <p className="text-white/70 mb-2">
                      Our algorithm suggests reducing BTC exposure by 10% and increasing stablecoin allocation.
                    </p>
                    <ul className="list-disc pl-4 text-white/70 space-y-1">
                      <li>Expected Risk Reduction: 15%</li>
                      <li>Expected Return Impact: -2%</li>
                      <li>Sharpe Ratio Improvement: +0.3</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RiskAnalysisPage;
