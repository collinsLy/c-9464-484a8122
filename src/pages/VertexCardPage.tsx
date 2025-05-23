
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { CreditCard, Shield, Globe, Bell, ChevronRight, Gift, Percent, RefreshCw, DollarSign, ArrowRight, Wallet, Settings, Star, Info, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Credit3DCard from '@/components/trading/Credit3DCard';
import VertexCardApplication from '@/components/trading/VertexCardApplication';


const VertexCardPage: React.FC = () => {
  const { isDemoMode } = useDashboardContext();
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [isCardActive, setIsCardActive] = useState(false);
  
  useEffect(() => {
    const checkCardApplication = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      // Create a listener for real-time updates to the application status
      const cardAppRef = doc(db, 'cardApplications', user.uid);
      const unsubscribe = onSnapshot(cardAppRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setApplicationStatus(data.status);
          setApplicationData(data);
          
          // If approved, set card as active
          if (data.status === 'approved') {
            setIsCardActive(true);
          }
        } else {
          setApplicationStatus('none');
          setApplicationData(null);
        }
      }, (error) => {
        console.error("Error checking card application status:", error);
      });
      
      return unsubscribe;
    };
    
    checkCardApplication();
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
                <TabsTrigger value="apply" className="data-[state=active]:bg-accent text-white">Apply</TabsTrigger>
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
                      
                      {/* Application Status Banner */}
                      {applicationStatus !== 'approved' && (
                        <div className={`p-4 rounded-lg flex items-start space-x-3 mt-4 ${
                          applicationStatus === 'pending' 
                            ? 'bg-yellow-900/20 border border-yellow-900/30' 
                            : applicationStatus === 'rejected' 
                              ? 'bg-red-900/20 border border-red-900/30'
                              : 'bg-blue-900/20 border border-blue-900/30'
                        }`}>
                          {applicationStatus === 'pending' ? (
                            <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          ) : applicationStatus === 'rejected' ? (
                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">
                              {applicationStatus === 'pending' 
                                ? 'Your card application is under review' 
                                : applicationStatus === 'rejected' 
                                  ? 'Your card application was not approved'
                                  : 'Apply for your Vertex Card today'}
                            </p>
                            <p className="text-sm text-white/70 mt-1">
                              {applicationStatus === 'pending' 
                                ? 'We are reviewing your application and will notify you once it\'s approved.'
                                : applicationStatus === 'rejected' 
                                  ? applicationData?.rejectionReason || 'Please contact support for more information.'
                                  : 'Click on the "Apply" tab to start your application process.'}
                            </p>
                            {applicationStatus === 'none' && (
                              <Button 
                                variant="link" 
                                className="text-accent p-0 h-auto mt-2" 
                                onClick={() => document.querySelector('[value="apply"]')?.dispatchEvent(new Event('click'))}
                              >
                                Apply now →
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* 3D Credit Card Component */}
                      <div className="mt-6">
                        <Credit3DCard />
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
                      
                      {/* Additional card info */}
                      <div className="mt-6">
                        <Card className="bg-slate-800 p-4 rounded-lg border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Shield className="h-5 w-5 text-green-400" />
                              <span className="text-white font-medium">Card Protected</span>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="apply">
                <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                  {applicationStatus === 'approved' ? (
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <h2 className="text-xl font-semibold">Congratulations!</h2>
                      <p className="max-w-md text-white/80">
                        Your Vertex Card application has been approved and your card is now active.
                      </p>
                      <Button 
                        className="bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] mt-4"
                        onClick={() => document.querySelector('[value="overview"]')?.dispatchEvent(new Event('click'))}
                      >
                        View Your Card
                      </Button>
                    </CardContent>
                  ) : applicationStatus === 'pending' ? (
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Clock className="h-8 w-8 text-yellow-500" />
                      </div>
                      <h2 className="text-xl font-semibold">Application Under Review</h2>
                      <p className="max-w-md text-white/80">
                        Your Vertex Card application is currently being reviewed. We'll notify you once it's approved.
                      </p>
                      <div className="w-full max-w-md bg-white/5 p-4 rounded-lg text-left mt-4">
                        <h3 className="font-medium mb-2">Application Details</h3>
                        <ul className="space-y-2 text-sm text-white/70">
                          <li><span className="text-white/50">Submitted:</span> {new Date(applicationData?.createdAt?.toDate()).toLocaleDateString()}</li>
                          <li><span className="text-white/50">Status:</span> Pending Review</li>
                          <li><span className="text-white/50">Reference:</span> VC-{auth.currentUser?.uid.substring(0, 8).toUpperCase()}</li>
                        </ul>
                      </div>
                    </CardContent>
                  ) : applicationStatus === 'rejected' ? (
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                      </div>
                      <h2 className="text-xl font-semibold">Application Not Approved</h2>
                      <p className="max-w-md text-white/80">
                        Unfortunately, your card application could not be approved at this time.
                      </p>
                      <div className="w-full max-w-md bg-white/5 p-4 rounded-lg text-left mt-4">
                        <h3 className="font-medium mb-2">Reason</h3>
                        <p className="text-sm text-white/70">
                          {applicationData?.rejectionReason || 'Please contact our support team for more information about your application.'}
                        </p>
                      </div>
                      <Button 
                        className="bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] mt-4"
                        onClick={() => document.querySelector('[value="overview"]')?.dispatchEvent(new Event('click'))}
                      >
                        Contact Support
                      </Button>
                    </CardContent>
                  ) : (
                    <VertexCardApplication />
                  )}
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
                      
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-white/10 rounded-lg bg-white/5">
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
                          <CreditCard className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white">No Transactions Yet</h3>
                          <p className="text-sm text-white/70 max-w-sm mt-1">
                            Your card transactions will appear here once you start using your Vertex Card.
                          </p>
                        </div>
                        <Button variant="outline" className="mt-4 border-white/10 hover:bg-white/10">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex items-center bg-blue-950/40 p-4 rounded-lg text-sm">
                          <Info className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                          <p className="text-white/80">
                            {applicationStatus === 'approved' 
                              ? 'Your card is active. Start making transactions to see them listed here.'
                              : applicationStatus === 'pending' 
                                ? 'Your card application is being reviewed. Once approved, you can start making transactions.'
                                : applicationStatus === 'rejected' 
                                  ? 'Your card application was not approved. Please contact support for assistance.'
                                  : 'To activate your Vertex Card and start making transactions, please apply for a card in the "Apply" tab.'}
                          </p>
                        </div>
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
