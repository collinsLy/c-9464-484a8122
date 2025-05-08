import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Shield, Globe, Bell, ChevronRight, Gift, 
  Percent, RefreshCw, DollarSign, ArrowRight, Wallet, 
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { auth } from '@/lib/firebase';
import { UserBalanceService } from '@/lib/firebase-service';

const VertexCardPage = () => {
  const { isDemoMode } = useDashboardContext();
  const navigate = useNavigate();
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user and their balance
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const currentUser = auth.currentUser;
        if (!currentUser && !isDemoMode) {
          navigate('/');
          return;
        }

        const uid = currentUser?.uid || 'demo-user';
        setUserId(uid);

        if (!isDemoMode && currentUser) {
          // Subscribe to real-time balance updates
          const unsubscribe = UserBalanceService.subscribeToBalance(uid, (balance) => {
            setUserBalance(balance);
            // Calculate a percentage of balance as monthly spending (this would ideally be from transaction history)
            setMonthlySpending(balance * 0.15);
            setIsLoading(false);
          });

          return () => unsubscribe();
        } else {
          // Demo mode - simulate data
          setUserBalance(5000);
          setMonthlySpending(750);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isDemoMode, navigate]);

  const handleToggleFreezeCard = () => {
    setIsCardFrozen((prev) => !prev);
    toast.success(`Card ${isCardFrozen ? 'unfrozen' : 'frozen'} successfully`);
  };

  const handleOpenATM = () => {
    toast.info('ATM locator will be available soon');
  };

  const handleRequestNewCard = () => {
    toast.success('New card request submitted successfully');
  };

  const handleSetupAutoPay = () => {
    navigate('/settings?tab=payments');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-6">
          <h1 className="text-3xl font-bold text-white">Vertex Card</h1>
          <p className="text-slate-400">
            Manage your Vertex Card settings, view transactions, and more.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card Overview */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-blue-900 to-indigo-900 text-white border-0">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Vertex Card</span>
                  <CreditCard className="h-6 w-6" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-sm text-blue-200">Available Balance</p>
                    <h2 className="text-3xl font-bold">
                      {isLoading ? 'Loading...' : `$${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </h2>
                  </div>

                  <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-blue-200" />
                      <span>Card Status</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{isCardFrozen ? 'Frozen' : 'Active'}</span>
                      <Switch checked={!isCardFrozen} onCheckedChange={handleToggleFreezeCard} />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <p className="text-sm text-blue-200">Monthly Spending</p>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-400 h-full rounded-full" 
                        style={{ width: `${Math.min((monthlySpending / userBalance) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-right">
                      ${monthlySpending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      /{userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/10 pt-4">
                <Button variant="outline" className="w-full bg-white/10 border-0 text-white hover:bg-white/20">
                  View Card Details
                </Button>
              </CardFooter>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between hover:bg-white/5"
                  onClick={handleToggleFreezeCard}
                >
                  <div className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    <span>{isCardFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full justify-between hover:bg-white/5"
                  onClick={handleRequestNewCard}
                >
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    <span>Request New Card</span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full justify-between hover:bg-white/5"
                  onClick={handleOpenATM}
                >
                  <div className="flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    <span>Find ATM</span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full justify-between hover:bg-white/5"
                  onClick={handleSetupAutoPay}
                >
                  <div className="flex items-center">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    <span>Setup Auto Pay</span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Card Tabs */}
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid grid-cols-3 bg-background/40 backdrop-blur-lg">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4 mt-4">
              <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">Loading transactions...</div>
                  ) : (
                    <div className="space-y-4">
                      {isDemoMode ? (
                        // Demo transactions 
                        Array.from({ length: 5 }).map((_, index) => {
                          const date = new Date();
                          date.setDate(date.getDate() - index);
                          const isDebit = index % 3 !== 0;
                          const amount = isDebit ? 
                            (25 + Math.random() * 150).toFixed(2) : 
                            (100 + Math.random() * 500).toFixed(2);

                          const merchants = [
                            "Starbucks", "Amazon", "Uber", "Netflix", "Walmart",
                            "Coinbase", "Transfer", "ATM Withdrawal", "Shopify", "App Store"
                          ];
                          const merchant = merchants[Math.floor(Math.random() * merchants.length)];

                          return (
                            <div key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${isDebit ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                                  {isDebit ? 
                                    <ArrowRight className="h-4 w-4 text-red-500" /> : 
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                  }
                                </div>
                                <div>
                                  <p className="font-medium">{merchant}</p>
                                  <p className="text-sm text-white/60">{date.toLocaleDateString()}</p>
                                </div>
                              </div>
                              <p className={isDebit ? 'text-red-400' : 'text-green-400'}>
                                {isDebit ? '-' : '+'}${amount}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        // Here you would integrate with your transaction API
                        <div className="text-center py-4">
                          Your actual transactions will appear here when available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-white/10 pt-4">
                  <Button variant="outline" className="w-full bg-white/10 border-0 text-white hover:bg-white/20">
                    View All Transactions
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4 mt-4">
              <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Your Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-amber-500/20">
                          <Gift className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium">Crypto Cashback</p>
                          <p className="text-sm text-white/60">Earn BTC on all purchases</p>
                        </div>
                      </div>
                      <p className="text-amber-400">3%</p>
                    </div>

                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-purple-500/20">
                          <Percent className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">Trading Fee Discount</p>
                          <p className="text-sm text-white/60">Reduced fees on trades</p>
                        </div>
                      </div>
                      <p className="text-purple-400">15%</p>
                    </div>

                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-blue-500/20">
                          <Wallet className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Higher Staking Rewards</p>
                          <p className="text-sm text-white/60">Bonus yield on staked assets</p>
                        </div>
                      </div>
                      <p className="text-blue-400">+2%</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-white/10 pt-4 flex justify-between">
                  <Button variant="outline" className="bg-white/10 border-0 text-white hover:bg-white/20">
                    Redeem Rewards
                  </Button>
                  <Button variant="outline" className="bg-white/10 border-0 text-white hover:bg-white/20">
                    View Benefits
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Card Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Transaction Notifications</span>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex justify-between items-center p-3">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>International Transactions</span>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex justify-between items-center p-3">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Spending Analytics</span>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm text-white/60 mb-3">Card Limits</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Daily Withdrawal</span>
                        <span>$2,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Monthly Spending</span>
                        <span>$20,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Per Transaction</span>
                        <span>$5,000</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-white/10 pt-4">
                  <Button variant="outline" className="w-full bg-white/10 border-0 text-white hover:bg-white/20">
                    Update Limits
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VertexCardPage;