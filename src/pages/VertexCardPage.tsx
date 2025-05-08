import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { CreditCard, Shield, Globe, Bell, ChevronRight, Gift, Percent, RefreshCw, DollarSign, ArrowRight, Wallet, Settings, Star } from "lucide-react";
import { toast } from "sonner";

const VertexCardPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [cardTab, setCardTab] = useState("overview");
  const [cardType, setCardType] = useState("virtual");
  const [cardFreeze, setCardFreeze] = useState(false);
  
  const applyForCard = () => {
    if (isDemoMode) {
      toast.success("Card application submitted", {
        description: "Your Vertex Card application is being processed.",
      });
    } else {
      toast.error("Please enable demo mode to test this feature");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Vertex Card</h1>
            <p className="text-sm text-white/70 mt-1">Spend your crypto anywhere Visa is accepted</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader className="pb-2">
                <Tabs defaultValue={cardTab} onValueChange={setCardTab}>
                  <TabsList className="w-full bg-white/5 text-white">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">Overview</TabsTrigger>
                    <TabsTrigger value="transactions" className="data-[state=active]:bg-white/10">Transactions</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-white/10">Settings</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <TabsContent value="overview" className="mt-0 space-y-4">
                  {isDemoMode ? (
                    <>
                      <div className="relative mx-auto w-full max-w-[400px] h-[220px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 p-6 shadow-lg">
                        <div className="absolute top-0 left-0 w-full h-full">
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0a0a0a]/80 to-[#111]/70 backdrop-blur-sm"></div>
                          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#F2FF44] opacity-30 rounded-full filter blur-2xl transform translate-x-10 translate-y-10"></div>
                          <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500 opacity-20 rounded-full filter blur-2xl transform -translate-x-10 -translate-y-10"></div>
                        </div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex justify-between items-start">
                            <div className="text-2xl font-bold tracking-wider text-white">VERTEX</div>
                            <div className="flex space-x-1">
                              <div className="w-6 h-6 bg-yellow-500 rounded-full opacity-70"></div>
                              <div className="w-6 h-6 bg-yellow-500 rounded-full opacity-90 -ml-3"></div>
                            </div>
                          </div>
                          
                          <div className="mt-auto">
                            <div className="font-mono text-lg tracking-wider text-white">•••• •••• •••• 4258</div>
                            <div className="flex justify-between mt-4">
                              <div>
                                <div className="text-xs text-white/70">CARD HOLDER</div>
                                <div className="text-sm font-medium text-white">JOHN DOE</div>
                              </div>
                              <div>
                                <div className="text-xs text-white/70">EXPIRES</div>
                                <div className="text-sm font-medium text-white">05/28</div>
                              </div>
                              <div className="flex items-end">
                                <div className="w-12 h-8">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="w-full h-full fill-white">
                                    <path d="M470.1 231.3s7.6 37.2 9.3 45H446c3.3-8.9 16-43.5 16-43.5-.2.3 3.3-9.1 5.3-14.9l2.8 13.4zM576 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h480c26.5 0 48 21.5 48 48zM152.5 331.2L215.7 176h-42.5l-39.3 106-4.3-21.5-14-71.4c-2.3-9.9-9.4-12.7-18.2-13.1H32.7l-.7 3.1c15.9 4 29.9 9.8 42.2 16.9l35.8 135h42.5zm94.4.2L272.1 176h-40.2l-25.1 155.4h40.1zm139.9-50.8c.2-17.7-10.6-31.2-33.7-42.3-14.1-7.1-22.7-11.9-22.7-19.2.2-6.6 7.3-13.4 23.1-13.4 13.1-.3 22.7 2.8 29.9 5.9l3.6 1.7 5.5-33.6c-7.9-3.1-20.5-6.6-36-6.6-39.7 0-67.6 21.2-67.8 51.4-.3 22.3 20 34.7 35.2 42.2 15.5 7.6 20.8 12.6 20.8 19.3-.2 10.4-12.6 15.2-24.1 15.2-16 0-24.6-2.5-37.7-8.3l-5.3-2.5-5.6 34.9c9.4 4.3 26.8 8.1 44.8 8.3 42.2.1 69.7-20.8 70-53zM528 331.4L495.6 176h-31.1c-9.6 0-16.9 2.8-21 12.9l-59.7 142.5H426s6.9-19.2 8.4-23.3H486c1.2 5.5 4.8 23.3 4.8 23.3H528z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-6">
                            <div className="flex flex-col">
                              <h3 className="text-sm font-medium text-white/70">Card Balance</h3>
                              <div className="flex items-end gap-2 mt-2">
                                <span className="text-2xl font-bold text-white">$2,348.50</span>
                                <Badge className="bg-green-500/20 text-green-500">+$214.32 today</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-6">
                            <div className="flex flex-col">
                              <h3 className="text-sm font-medium text-white/70">Monthly Spend</h3>
                              <div className="flex items-end gap-2 mt-2">
                                <span className="text-2xl font-bold text-white">$1,245.67</span>
                                <Badge className="bg-white/10 text-white/70">2.1% cashback</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-6">
                            <div className="flex flex-col">
                              <h3 className="text-sm font-medium text-white/70">Rewards Earned</h3>
                              <div className="flex items-end gap-2 mt-2">
                                <span className="text-2xl font-bold text-white">26.21 VTEX</span>
                                <Badge className="bg-[#F2FF44]/20 text-[#F2FF44]">+3.4 today</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                        <Card className="bg-white/5 border-white/10">
                          <CardHeader>
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-3">
                              <Button variant="outline" className="flex items-center justify-start space-x-2 py-6 border-white/10 hover:bg-white/10 hover:text-white">
                                <DollarSign className="h-4 w-4 text-[#F2FF44]" />
                                <span>Top Up</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex items-center justify-start space-x-2 py-6 border-white/10 hover:bg-white/10 hover:text-white"
                                onClick={() => setCardFreeze(!cardFreeze)}
                              >
                                <Shield className="h-4 w-4 text-[#F2FF44]" />
                                <span>{cardFreeze ? "Unfreeze Card" : "Freeze Card"}</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex items-center justify-start space-x-2 py-6 border-white/10 hover:bg-white/10 hover:text-white"
                                onClick={() => setCardTab("settings")}
                              >
                                <Settings className="h-4 w-4 text-[#F2FF44]" />
                                <span>Card Settings</span>
                              </Button>
                              <Button variant="outline" className="flex items-center justify-start space-x-2 py-6 border-white/10 hover:bg-white/10 hover:text-white">
                                <Globe className="h-4 w-4 text-[#F2FF44]" />
                                <span>Web Payments</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-white/5 border-white/10">
                          <CardHeader>
                            <CardTitle className="text-base">Recent Transactions</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <CreditCard className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Starbucks</div>
                                    <div className="text-xs text-white/70">Today, 9:45 AM</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">-$4.85</div>
                                  <div className="text-xs text-green-400">+0.12 VTEX</div>
                                </div>
                              </div>
                              
                              <Separator className="bg-white/10" />
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <CreditCard className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Amazon</div>
                                    <div className="text-xs text-white/70">Yesterday, 2:30 PM</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">-$28.74</div>
                                  <div className="text-xs text-green-400">+0.57 VTEX</div>
                                </div>
                              </div>
                              
                              <Separator className="bg-white/10" />
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <RefreshCw className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Card Top Up</div>
                                    <div className="text-xs text-white/70">May 15, 11:20 AM</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-green-400">+$500.00</div>
                                  <div className="text-xs text-white/70">From BTC Wallet</div>
                                </div>
                              </div>
                              
                              <div className="pt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full border-white/10 hover:bg-white/10 hover:text-white"
                                  onClick={() => setCardTab("transactions")}
                                >
                                  View All Transactions
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card className="bg-white/5 border-white/10 mt-4">
                        <CardHeader>
                          <CardTitle className="text-base">Cashback & Rewards</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                                    <Percent className="h-5 w-5 text-[#F2FF44]" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Crypto Cashback</div>
                                    <div className="text-sm text-white/70">Earn VTEX tokens on every purchase</div>
                                  </div>
                                </div>
                                <Badge className="bg-green-500/20 text-green-500">2.1% Rate</Badge>
                              </div>
                              
                              <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-white/70">Monthly Cashback Progress</span>
                                  <span>$26.21 / $50 target</span>
                                </div>
                                <Progress value={52} className="h-2 bg-white/10" indicatorClassName="bg-[#F2FF44]" />
                              </div>
                            </div>
                            
                            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                                    <Star className="h-5 w-5 text-[#F2FF44]" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Premium Benefits</div>
                                    <div className="text-sm text-white/70">Silver tier membership benefits</div>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10 hover:text-white">
                                  Upgrade
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span className="text-sm">Airport Lounge Access</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span className="text-sm">Cashback Boost</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 rounded-full bg-white/50"></div>
                                  <span className="text-sm text-white/50">Premium Support</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 rounded-full bg-white/50"></div>
                                  <span className="text-sm text-white/50">Travel Insurance</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CreditCard className="h-16 w-16 text-white/30 mb-4" />
                      <h2 className="text-xl font-bold text-white mb-2">Get Your Vertex Card</h2>
                      <p className="text-white/70 max-w-md mb-6">Spend your crypto anywhere Visa is accepted. Earn up to 8% cashback in VTEX tokens on every purchase.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                        <Button 
                          className="bg-[#F2FF44] text-black hover:bg-[#E1EE33]"
                          onClick={applyForCard}
                        >
                          Apply Now
                        </Button>
                        <Button variant="outline" className="border-white/10 hover:bg-white/10 hover:text-white">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="transactions" className="mt-0 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Transaction History</h3>
                    <div className="flex items-center space-x-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          <SelectItem value="all">All Transactions</SelectItem>
                          <SelectItem value="purchases">Purchases</SelectItem>
                          <SelectItem value="topups">Top Ups</SelectItem>
                          <SelectItem value="refunds">Refunds</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/10 hover:text-white">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {isDemoMode ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-white/70">Merchant</TableHead>
                          <TableHead className="text-white/70">Date</TableHead>
                          <TableHead className="text-white/70">Amount</TableHead>
                          <TableHead className="text-white/70">Status</TableHead>
                          <TableHead className="text-white/70">Cashback</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <CreditCard className="h-4 w-4" />
                              </div>
                              <span>Starbucks</span>
                            </div>
                          </TableCell>
                          <TableCell>Today, 9:45 AM</TableCell>
                          <TableCell>$4.85</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-500">Completed</Badge>
                          </TableCell>
                          <TableCell className="text-green-400">+0.12 VTEX</TableCell>
                        </TableRow>
                        
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <CreditCard className="h-4 w-4" />
                              </div>
                              <span>Amazon</span>
                            </div>
                          </TableCell>
                          <TableCell>Yesterday, 2:30 PM</TableCell>
                          <TableCell>$28.74</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-500">Completed</Badge>
                          </TableCell>
                          <TableCell className="text-green-400">+0.57 VTEX</TableCell>
                        </TableRow>
                        
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <RefreshCw className="h-4 w-4" />
                              </div>
                              <span>Card Top Up</span>
                            </div>
                          </TableCell>
                          <TableCell>May 15, 11:20 AM</TableCell>
                          <TableCell className="text-green-400">+$500.00</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-500">Completed</Badge>
                          </TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                        
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <CreditCard className="h-4 w-4" />
                              </div>
                              <span>Netflix</span>
                            </div>
                          </TableCell>
                          <TableCell>May 12, 6:15 PM</TableCell>
                          <TableCell>$14.99</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-500">Completed</Badge>
                          </TableCell>
                          <TableCell className="text-green-400">+0.30 VTEX</TableCell>
                        </TableRow>
                        
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <CreditCard className="h-4 w-4" />
                              </div>
                              <span>Uber</span>
                            </div>
                          </TableCell>
                          <TableCell>May 10, 9:22 PM</TableCell>
                          <TableCell>$12.50</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-500">Completed</Badge>
                          </TableCell>
                          <TableCell className="text-green-400">+0.25 VTEX</TableCell>
                        </TableRow>
                        
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <CreditCard className="h-4 w-4" />
                              </div>
                              <span>Apple</span>
                            </div>
                          </TableCell>
                          <TableCell>May 8, 3:45 PM</TableCell>
                          <TableCell>$0.99</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-500">Completed</Badge>
                          </TableCell>
                          <TableCell className="text-green-400">+0.02 VTEX</TableCell>
                        </TableRow>
                        
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <CreditCard className="h-4 w-4" />
                              </div>
                              <span>Walmart</span>
                            </div>
                          </TableCell>
                          <TableCell>May 5, 11:30 AM</TableCell>
                          <TableCell>$87.32</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-500">Completed</Badge>
                          </TableCell>
                          <TableCell className="text-green-400">+1.75 VTEX</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-12 text-center text-white/70">
                      No transaction history available
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="settings" className="mt-0 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Card Settings</h3>
                    {isDemoMode && <Badge className="bg-amber-500/20 text-amber-500">Virtual Card Active</Badge>}
                  </div>
                  
                  {isDemoMode ? (
                    <>
                      <div className="space-y-4">
                        <Card className="bg-white/5 border-white/10">
                          <CardHeader>
                            <CardTitle className="text-base">Card Type</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex space-x-4">
                              <Button
                                variant={cardType === "virtual" ? "default" : "outline"}
                                className={cardType !== "virtual" ? "border-white/10 hover:bg-white/10 hover:text-white" : "bg-[#F2FF44] text-black hover:bg-[#E1EE33]"}
                                onClick={() => setCardType("virtual")}
                              >
                                Virtual Card
                              </Button>
                              <Button
                                variant={cardType === "physical" ? "default" : "outline"}
                                className={cardType !== "physical" ? "border-white/10 hover:bg-white/10 hover:text-white" : "bg-[#F2FF44] text-black hover:bg-[#E1EE33]"}
                                onClick={() => setCardType("physical")}
                              >
                                Physical Card
                              </Button>
                            </div>
                            
                            {cardType === "physical" && (
                              <div className="mt-4 rounded-lg bg-white/5 p-4 border border-white/10">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-[#F2FF44]" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Order Physical Card</div>
                                    <div className="text-sm text-white/70">Get your card delivered to your address</div>
                                  </div>
                                </div>
                                <Button className="w-full mt-4 bg-[#F2FF44] text-black hover:bg-[#E1EE33]">
                                  Order Card ($9.99)
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-white/5 border-white/10">
                          <CardHeader>
                            <CardTitle className="text-base">Security Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-base">Freeze Card</Label>
                                  <p className="text-sm text-white/70">Temporarily block all transactions</p>
                                </div>
                                <Switch 
                                  checked={cardFreeze}
                                  onCheckedChange={setCardFreeze}
                                  className="data-[state=checked]:bg-[#F2FF44]"
                                />
                              </div>
                              
                              <Separator className="bg-white/10" />
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-base">Online Payments</Label>
                                  <p className="text-sm text-white/70">Allow card to be used for online purchases</p>
                                </div>
                                <Switch 
                                  defaultChecked={true}
                                  className="data-[state=checked]:bg-[#F2FF44]"
                                />
                              </div>
                              
                              <Separator className="bg-white/10" />
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-base">ATM Withdrawals</Label>
                                  <p className="text-sm text-white/70">Allow ATM cash withdrawals</p>
                                </div>
                                <Switch 
                                  defaultChecked={true}
                                  className="data-[state=checked]:bg-[#F2FF44]"
                                />
                              </div>
                              
                              <Separator className="bg-white/10" />
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-base">International Transactions</Label>
                                  <p className="text-sm text-white/70">Allow transactions outside your country</p>
                                </div>
                                <Switch 
                                  defaultChecked={false}
                                  className="data-[state=checked]:bg-[#F2FF44]"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-white/5 border-white/10">
                          <CardHeader>
                            <CardTitle className="text-base">Spending Limits</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Daily Spending Limit</Label>
                                <Select defaultValue="500">
                                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select limit" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="100">$100</SelectItem>
                                    <SelectItem value="250">$250</SelectItem>
                                    <SelectItem value="500">$500</SelectItem>
                                    <SelectItem value="1000">$1,000</SelectItem>
                                    <SelectItem value="2500">$2,500</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>ATM Withdrawal Limit</Label>
                                <Select defaultValue="250">
                                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select limit" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="100">$100</SelectItem>
                                    <SelectItem value="250">$250</SelectItem>
                                    <SelectItem value="500">$500</SelectItem>
                                    <SelectItem value="1000">$1,000</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <Button className="w-full bg-[#F2FF44] text-black hover:bg-[#E1EE33]">
                                Save Limits
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-white/5 border-white/10">
                          <CardHeader>
                            <CardTitle className="text-base">Notifications</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-base">Push Notifications</Label>
                                  <p className="text-sm text-white/70">Receive alerts for all transactions</p>
                                </div>
                                <Switch 
                                  defaultChecked={true}
                                  className="data-[state=checked]:bg-[#F2FF44]"
                                />
                              </div>
                              
                              <Separator className="bg-white/10" />
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-base">Email Notifications</Label>
                                  <p className="text-sm text-white/70">Receive transaction summaries by email</p>
                                </div>
                                <Switch 
                                  defaultChecked={true}
                                  className="data-[state=checked]:bg-[#F2FF44]"
                                />
                              </div>
                              
                              <Separator className="bg-white/10" />
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-base">Large Transaction Alerts</Label>
                                  <p className="text-sm text-white/70">Get alerted for transactions over $100</p>
                                </div>
                                <Switch 
                                  defaultChecked={true}
                                  className="data-[state=checked]:bg-[#F2FF44]"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-white/70">
                      Apply for a Vertex Card to manage card settings
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-1/3">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Card Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <Percent className="h-5 w-5 text-[#F2FF44]" />
                      </div>
                      <div>
                        <div className="font-medium">Crypto Cashback</div>
                        <div className="text-sm text-white/70">Up to 8% back in VTEX tokens</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-[#F2FF44]" />
                      </div>
                      <div>
                        <div className="font-medium">Global Acceptance</div>
                        <div className="text-sm text-white/70">Use anywhere Visa is accepted</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-[#F2FF44]" />
                      </div>
                      <div>
                        <div className="font-medium">Security Controls</div>
                        <div className="text-sm text-white/70">Freeze card, set limits & more</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#F2FF44]/20 flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 text-[#F2FF44]" />
                      </div>
                      <div>
                        <div className="font-medium">Instant Top Up</div>
                        <div className="text-sm text-white/70">Fund from your crypto wallet instantly</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white mt-4">
              <CardHeader>
                <CardTitle>Membership Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Standard</div>
                      <Badge className={isDemoMode ? "bg-white/20 text-white" : "bg-[#F2FF44] text-black"}>
                        {isDemoMode ? "Current" : "Available"}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-[#F2FF44]" />
                        </div>
                        <span>2% cashback on all purchases</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-[#F2FF44]" />
                        </div>
                        <span>Virtual card included</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-[#F2FF44]" />
                        </div>
                        <span>No monthly fees</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-gradient-to-r from-slate-700 to-blue-800 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Premium</div>
                      <Badge variant="outline" className="border-white/10">
                        Stake 1000 VTEX
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-[#F2FF44]" />
                        </div>
                        <span>4% cashback on all purchases</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-[#F2FF44]" />
                        </div>
                        <span>Free physical card</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-[#F2FF44]" />
                        </div>
                        <span>Airport lounge access (2x/year)</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 w-full border-white/10 hover:bg-white/10 hover:text-white">
                      Upgrade to Premium
                    </Button>
                  </div>
                  
                  <div className="rounded-lg bg-gradient-to-r from-amber-900 to-yellow-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Elite</div>
                      <Badge variant="outline" className="border-white/10">
                        Stake 5000 VTEX
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-[#F2FF44]" />
                        </div>
                        <span>8% cashback on all purchases</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-[#F2FF44]" />
                        </div>
                        <span>Metal card included</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-[#F2FF44]" />
                        </div>
                        <span>Unlimited airport lounge access</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-[#F2FF44]" />
                        </div>
                        <span>Travel insurance included</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 w-full border-white/10 hover:bg-white/10 hover:text-white">
                      Upgrade to Elite
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {isDemoMode && (
              <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white mt-4">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start text-left border-white/10 hover:bg-white/10 hover:text-white">
                      <Wallet className="mr-2 h-4 w-4 text-[#F2FF44]" />
                      <span>Top Up Card</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left border-white/10 hover:bg-white/10 hover:text-white">
                      <Bell className="mr-2 h-4 w-4 text-[#F2FF44]" />
                      <span>Manage Notifications</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left border-white/10 hover:bg-white/10 hover:text-white">
                      <Gift className="mr-2 h-4 w-4 text-[#F2FF44]" />
                      <span>Refer a Friend</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left border-white/10 hover:bg-white/10 hover:text-white">
                      <ArrowRight className="mr-2 h-4 w-4 text-[#F2FF44]" />
                      <span>Contact Support</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VertexCardPage;