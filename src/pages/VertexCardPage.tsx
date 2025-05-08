import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { CreditCard, Shield, Globe, Bell, ChevronRight, Gift, Percent, RefreshCw, DollarSign, ArrowRight, Wallet, Settings, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const VertexCardPage: React.FC = () => {
  const { isDemoMode } = useDashboardContext();
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-6">
          <h1 className="text-3xl font-bold">Vertex Card</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Access financial services with the Vertex Card.
          </p>

          <div className="grid gap-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="manage">Manage Card</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Card Overview</h3>
                      <p>Your Vertex Card gives you global access to your crypto assets in real-world spending.</p>
                      {isDemoMode && (
                        <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
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
                        <Card className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Available Balance</div>
                          <div className="text-2xl font-semibold">$2,450.25</div>
                        </Card>
                        <Card className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Monthly Spending</div>
                          <div className="text-2xl font-semibold">$1,240.80</div>
                        </Card>
                        <Card className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Reward Points</div>
                          <div className="text-2xl font-semibold">2,450</div>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manage Card Tab -  Simplified from original */}
              <TabsContent value="manage">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Manage Your Card</h3>
                      <p>Control your card settings and security options.</p>
                      <div className="mt-6 grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Card Status</div>
                            <div className="text-green-600">Active</div>
                          </div>
                          <Button className="px-4 py-2 bg-red-500 text-white rounded-md">Freeze Card</Button>
                        </div>
                        {/* Added other manage card features here */}

                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transactions Tab - Simplified from original */}
              <TabsContent value="transactions">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Recent Transactions</h3>
                      <p>View your recent card activity.</p>
                      <div className="mt-6 space-y-4">
                        {/* Sample transactions - To be replaced with dynamic data */}
                        <div className="flex items-center justify-between p-4 border-b">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium">Amazon</div>
                              <div className="text-sm text-slate-500">May 22, 2023</div>
                            </div>
                          </div>
                          <div className="text-red-600 font-medium">-$34.76</div>
                        </div>
                        {/* More transactions here ... */}
                      </div>
                      <div className="mt-6">
                        <Button className="w-full py-2 bg-slate-200 dark:bg-slate-700 rounded-md">View All Transactions</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab - Simplified from original */}
              <TabsContent value="settings">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Card Settings</h3>
                      <p>Configure your card preferences and security options.</p>
                      <div className="mt-6 space-y-6">
                        <div>
                          {/* Notification Settings */}
                        </div>
                        <div>
                          {/* Security Settings */}
                        </div>
                        <div className="pt-4">
                          <Button className="px-4 py-2 bg-blue-500 text-white rounded-md">Save Changes</Button>
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