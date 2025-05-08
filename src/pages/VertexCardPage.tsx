
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { auth } from '@/lib/firebase';
import { CreditCard, Shield, Globe, Bell, ChevronRight, Gift, Percent, RefreshCw, DollarSign, ArrowRight, Wallet, Settings, Star, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const VertexCardPage: React.FC = () => {
  const { isDemoMode } = useDashboardContext();
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [monthlySpending, setMonthlySpending] = useState<number | null>(null);
  const [rewardPoints, setRewardPoints] = useState<number | null>(null);
  
  // Fetch user card data
  useEffect(() => {
    // In a real implementation, this would fetch data from your API
    const fetchCardData = async () => {
      try {
        if (auth.currentUser) {
          // Here you would make an API call to get the real data
          // For now we're showing API loading state
          setUserBalance(null);
          setMonthlySpending(null);
          setRewardPoints(null);
          
          // Simulate API call
          setTimeout(() => {
            // This would be replaced with actual API data
            // The API would fetch the real user's card data
            setUserBalance(0);
            setMonthlySpending(0);
            setRewardPoints(0);
          }, 1000);
        }
      } catch (error) {
        console.error("Error fetching card data:", error);
        setUserBalance(0);
        setMonthlySpending(0);
        setRewardPoints(0);
      }
    };
    
    fetchCardData();
  }, []);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-6">
          <h1 className="text-3xl font-bold text-white">Vertex Card</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Access financial services with the Vertex Card.
          </p>

          <div className="grid gap-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4 bg-background/80 border-white/10 text-white">
                <TabsTrigger value="overview" className="data-[state=active]:bg-accent text-white">Overview</TabsTrigger>
                <TabsTrigger value="manage" className="data-[state=active]:bg-accent text-white">Manage Card</TabsTrigger>
                <TabsTrigger value="transactions" className="data-[state=active]:bg-accent text-white">Transactions</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-accent text-white">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Card Overview</h3>
                      <p>Your Vertex Card gives you global access to your crypto assets in real-world spending.</p>
                      
                      {/* Binance Virtual Card based on the shared image */}
                      <div className="mt-6 bg-black rounded-xl p-4 shadow-lg relative overflow-hidden max-w-lg mx-auto">
                        {/* Card background pattern - black diamond pattern */}
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23222\' fill-opacity=\'0.8\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 0h20v20H0z\'/%3E%3C/g%3E%3C/svg%3E")',
                          backgroundSize: '10px 10px'
                        }}></div>
                        
                        {/* Card Content */}
                        <div className="relative z-10">
                          {/* Top row: Binance logo and virtual badge */}
                          <div className="flex justify-between items-center mb-8">
                            <div className="h-6 w-6 rounded-full flex items-center justify-center bg-white">
                              <Info className="h-4 w-4 text-black" />
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm font-bold mr-2">BINANCE</span>
                              <div className="bg-transparent border border-gray-600 rounded px-2 py-0.5">
                                <span className="text-xs text-gray-300">VIRTUAL</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Card number */}
                          <div className="font-mono text-lg font-medium mb-10">5360 •••• •••• 5858</div>
                          
                          {/* Bottom row: Cardholder and expiry/logo */}
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Card Holder</div>
                              <div className="text-sm font-medium uppercase">
                                {auth?.currentUser?.displayName || "USER NAME"}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="mr-3">
                                <div className="text-xs text-gray-400 mb-1">Expires</div>
                                <div className="text-sm">05/28</div>
                              </div>
                              <div className="flex">
                                <div className="h-5 w-5 bg-red-500 rounded-full"></div>
                                <div className="h-5 w-5 bg-yellow-500 rounded-full -ml-2"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Button controls */}
                      <div className="mt-6 grid grid-cols-3 gap-2">
                        <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto border-white/10 hover:bg-white/5">
                          <div className="w-6 h-6 bg-yellow-500/10 rounded-full flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="3" rx="2" />
                              <path d="M7 7h.01" />
                              <path d="M12 7h.01" />
                              <path d="M17 7h.01" />
                              <path d="M7 12h.01" />
                              <path d="M12 12h.01" />
                              <path d="M17 12h.01" />
                              <path d="M7 17h.01" />
                              <path d="M12 17h.01" />
                              <path d="M17 17h.01" />
                            </svg>
                          </div>
                          <span className="text-xs text-center">Show Details</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto border-white/10 hover:bg-white/5">
                          <div className="w-6 h-6 bg-yellow-500/10 rounded-full flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>
                          <span className="text-xs text-center">Manage</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto border-white/10 hover:bg-white/5">
                          <div className="w-6 h-6 bg-yellow-500/10 rounded-full flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <circle cx="12" cy="10" r="3" />
                              <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
                            </svg>
                          </div>
                          <span className="text-xs text-center">Profile</span>
                        </Button>
                      </div>
                      
                      {/* Card stats */}
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-slate-800 p-4 rounded-lg border-white/10">
                          <div className="text-sm text-slate-400">Available Balance</div>
                          {userBalance === null ? (
                            <div className="text-2xl font-semibold text-white h-7 bg-slate-700 animate-pulse rounded mt-1 w-24"></div>
                          ) : (
                            <div className="text-2xl font-semibold text-white">${userBalance.toFixed(2)}</div>
                          )}
                        </Card>
                        <Card className="bg-slate-800 p-4 rounded-lg border-white/10">
                          <div className="text-sm text-slate-400">Monthly Spending</div>
                          {monthlySpending === null ? (
                            <div className="text-2xl font-semibold text-white h-7 bg-slate-700 animate-pulse rounded mt-1 w-24"></div>
                          ) : (
                            <div className="text-2xl font-semibold text-white">${monthlySpending.toFixed(2)}</div>
                          )}
                        </Card>
                        <Card className="bg-slate-800 p-4 rounded-lg border-white/10">
                          <div className="text-sm text-slate-400">Reward Points</div>
                          {rewardPoints === null ? (
                            <div className="text-2xl font-semibold text-white h-7 bg-slate-700 animate-pulse rounded mt-1 w-24"></div>
                          ) : (
                            <div className="text-2xl font-semibold text-white">{rewardPoints}</div>
                          )}
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manage">
                <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Manage Your Card</h3>
                      <p>Control your card settings and security options.</p>
                      <div className="mt-6 grid gap-4">
                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-slate-800">
                          <div>
                            <div className="font-medium">Card Status</div>
                            <div className={isCardFrozen ? "text-red-500" : "text-green-500"}>
                              {isCardFrozen ? "Frozen" : "Active"}
                            </div>
                          </div>
                          <Button 
                            className={`px-4 py-2 ${isCardFrozen ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"} text-white rounded-md`}
                            onClick={() => setIsCardFrozen(!isCardFrozen)}
                          >
                            {isCardFrozen ? "Unfreeze Card" : "Freeze Card"}
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-slate-800">
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-blue-400" />
                            <div>
                              <div className="font-medium">Security Settings</div>
                              <div className="text-sm text-slate-400">Manage PIN, limits and permissions</div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-slate-800">
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-blue-400" />
                            <div>
                              <div className="font-medium">Regional Settings</div>
                              <div className="text-sm text-slate-400">Manage where your card can be used</div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-slate-800">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-blue-400" />
                            <div>
                              <div className="font-medium">Notifications</div>
                              <div className="text-sm text-slate-400">Set up alerts for transactions</div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions">
                <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Recent Transactions</h3>
                      <p>View your recent card activity.</p>
                      
                      <div className="flex items-center justify-between mt-4 mb-2">
                        <div className="font-medium">Transaction History</div>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[180px] bg-slate-800 border-white/10">
                            <SelectValue placeholder="Filter" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/10 text-white">
                            <SelectItem value="all">All Transactions</SelectItem>
                            <SelectItem value="purchases">Purchases</SelectItem>
                            <SelectItem value="payments">Payments</SelectItem>
                            <SelectItem value="refunds">Refunds</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium">Amazon</div>
                              <div className="text-sm text-slate-400">May 22, 2023</div>
                            </div>
                          </div>
                          <div className="text-red-500 font-medium">-$34.76</div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                              <div className="font-medium">Deposit</div>
                              <div className="text-sm text-slate-400">May 20, 2023</div>
                            </div>
                          </div>
                          <div className="text-green-500 font-medium">+$200.00</div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-purple-900 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium">Netflix</div>
                              <div className="text-sm text-slate-400">May 15, 2023</div>
                            </div>
                          </div>
                          <div className="text-red-500 font-medium">-$12.99</div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <Button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md">View All Transactions</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Card Settings</h3>
                      <p>Configure your card preferences and security options.</p>
                      
                      <div className="mt-6 space-y-6">
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center">
                            <Bell className="h-5 w-5 mr-2 text-blue-400" />
                            Notification Settings
                          </h4>
                          <div className="pl-7 space-y-2">
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <span>Transaction Notifications</span>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-green-500">Enabled</Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <span>Fraud Alerts</span>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-green-500">Enabled</Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <span>Payment Reminders</span>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-slate-500">Disabled</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center">
                            <Shield className="h-5 w-5 mr-2 text-blue-400" />
                            Security Settings
                          </h4>
                          <div className="pl-7 space-y-2">
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <span>Two-Factor Authentication</span>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-green-500">Enabled</Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <span>Purchase Limits</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-white/70">$5,000/day</span>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <span>International Transactions</span>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-green-500">Enabled</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Save Changes</Button>
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

export default VertexCardPage;
