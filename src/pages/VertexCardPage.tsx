
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { 
  CreditCard, Shield, Globe, Bell, ChevronRight, Gift, 
  Percent, RefreshCw, DollarSign, ArrowRight, Wallet, 
  Settings, Star, Lock, Fingerprint, AlertCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const VertexCardPage: React.FC = () => {
  const { isDemoMode } = useDashboardContext();
  const [isCardFrozen, setIsCardFrozen] = useState(false);

  const handleFreezeCard = () => {
    setIsCardFrozen(!isCardFrozen);
    toast({
      title: isCardFrozen ? "Card Activated" : "Card Frozen",
      description: isCardFrozen ? "Your Vertex Card has been activated." : "Your Vertex Card has been frozen for security.",
      variant: isCardFrozen ? "default" : "destructive",
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-6">
          <h1 className="text-3xl font-bold text-white">Vertex Card</h1>
          <p className="text-slate-400">
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
                <Card className="bg-slate-900/90 backdrop-blur-lg border-white/10 text-white">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Card Overview</h3>
                      <p className="text-slate-400">Your Vertex Card gives you global access to your crypto assets in real-world spending.</p>
                      {isDemoMode && (
                        <div className="mt-6 bg-gradient-to-r from-blue-900 to-purple-900 text-white rounded-xl p-6 shadow-lg">
                          <div className="flex flex-col h-48 justify-between">
                            <div className="flex justify-between items-start">
                              <div className="text-lg font-medium">VERTEX</div>
                              <div className="text-sm">Virtual Card</div>
                            </div>
                            <div className="text-lg font-mono">•••• •••• •••• 4321</div>
                            <div className="flex justify-between items-end">
                              <div>
                                <div className="text-xs">Card Holder</div>
                                <div>JOHN DOE</div>
                              </div>
                              <div>
                                <div className="text-xs">Expires</div>
                                <div>12/27</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-slate-800 p-4 rounded-lg border-white/10">
                          <div className="text-sm text-slate-400">Available Balance</div>
                          <div className="text-2xl font-semibold text-white">$2,450.25</div>
                        </Card>
                        <Card className="bg-slate-800 p-4 rounded-lg border-white/10">
                          <div className="text-sm text-slate-400">Monthly Spending</div>
                          <div className="text-2xl font-semibold text-white">$1,240.80</div>
                        </Card>
                        <Card className="bg-slate-800 p-4 rounded-lg border-white/10">
                          <div className="text-sm text-slate-400">Reward Points</div>
                          <div className="text-2xl font-semibold text-white">2,450</div>
                        </Card>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Recent Activity</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <div className="font-medium">Coffee Shop</div>
                                <div className="text-xs text-slate-400">Today, 10:24 AM</div>
                              </div>
                            </div>
                            <div className="text-red-400">-$4.75</div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center">
                                <RefreshCw className="h-5 w-5 text-green-400" />
                              </div>
                              <div>
                                <div className="font-medium">BTC Conversion</div>
                                <div className="text-xs text-slate-400">Yesterday, 3:42 PM</div>
                              </div>
                            </div>
                            <div className="text-green-400">+$150.00</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manage">
                <Card className="bg-slate-900/90 backdrop-blur-lg border-white/10 text-white">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Manage Your Card</h3>
                      <p className="text-slate-400">Control your card settings and security options.</p>
                      <div className="mt-6 grid gap-4">
                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-slate-800">
                          <div>
                            <div className="font-medium">Card Status</div>
                            <div className={isCardFrozen ? "text-red-500" : "text-green-500"}>
                              {isCardFrozen ? "Frozen" : "Active"}
                            </div>
                          </div>
                          <Button 
                            className={`px-4 py-2 ${isCardFrozen ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"} text-white rounded-md`}
                            onClick={handleFreezeCard}
                          >
                            {isCardFrozen ? "Activate Card" : "Freeze Card"}
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-slate-800 cursor-pointer hover:bg-slate-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-blue-400" />
                            <div>
                              <div className="font-medium">Security Settings</div>
                              <div className="text-sm text-slate-400">Manage PIN, limits and permissions</div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-slate-800 cursor-pointer hover:bg-slate-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-blue-400" />
                            <div>
                              <div className="font-medium">Regional Settings</div>
                              <div className="text-sm text-slate-400">Manage where your card can be used</div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-slate-800 cursor-pointer hover:bg-slate-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-blue-400" />
                            <div>
                              <div className="font-medium">Notifications</div>
                              <div className="text-sm text-slate-400">Set up alerts for transactions</div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-slate-800 cursor-pointer hover:bg-slate-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <Fingerprint className="h-5 w-5 text-blue-400" />
                            <div>
                              <div className="font-medium">Biometric Authentication</div>
                              <div className="text-sm text-slate-400">Secure your card with biometrics</div>
                            </div>
                          </div>
                          <Switch id="biometric" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions">
                <Card className="bg-slate-900/90 backdrop-blur-lg border-white/10 text-white">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Recent Transactions</h3>
                      <p className="text-slate-400">View your recent card activity.</p>
                      
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
                        
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-orange-900 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium">Uber</div>
                              <div className="text-sm text-slate-400">May 10, 2023</div>
                            </div>
                          </div>
                          <div className="text-red-500 font-medium">-$21.50</div>
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
                <Card className="bg-slate-900/90 backdrop-blur-lg border-white/10 text-white">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Card Settings</h3>
                      <p className="text-slate-400">Configure your card preferences and security options.</p>
                      
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
                                <Switch id="transaction-notifications" defaultChecked />
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <span>Fraud Alerts</span>
                              <div className="flex items-center space-x-2">
                                <Switch id="fraud-alerts" defaultChecked />
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <span>Payment Reminders</span>
                              <div className="flex items-center space-x-2">
                                <Switch id="payment-reminders" />
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
                                <Switch id="two-factor" defaultChecked />
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800 cursor-pointer hover:bg-slate-700 transition-colors">
                              <span>Purchase Limits</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-white/70">$5,000/day</span>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <span>International Transactions</span>
                              <div className="flex items-center space-x-2">
                                <Switch id="international" defaultChecked />
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <span>Online Purchases</span>
                              <div className="flex items-center space-x-2">
                                <Switch id="online-purchases" defaultChecked />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2 text-blue-400" />
                            Card Features
                          </h4>
                          <div className="pl-7 space-y-2">
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <div>
                                <span>Crypto Cashback</span>
                                <p className="text-xs text-slate-400 mt-1">Earn crypto rewards on purchases</p>
                              </div>
                              <Badge className="bg-blue-500/30 text-blue-400">Premium</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-white/10 rounded-lg bg-slate-800">
                              <div>
                                <span>Travel Insurance</span>
                                <p className="text-xs text-slate-400 mt-1">Coverage for trips paid with your card</p>
                              </div>
                              <Badge className="bg-blue-500/30 text-blue-400">Premium</Badge>
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
