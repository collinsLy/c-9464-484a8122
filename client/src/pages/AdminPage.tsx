import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { setUserBalance, setKelvinBalance } from "@/lib/set-user-balance";

const AdminPage = () => {
  const [email, setEmail] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetBalance = async () => {
    if (!email || !balance) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and balance",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await setUserBalance(email, parseFloat(balance));
      if (success) {
        toast({
          title: "Success",
          description: `Balance updated for ${email} to $${balance}`,
        });
        setEmail('');
        setBalance('');
      } else {
        toast({
          title: "Error",
          description: "User not found or update failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetKelvinBalance = async () => {
    setLoading(true);
    try {
      const success = await setKelvinBalance();
      if (success) {
        toast({
          title: "Success",
          description: "Kelvin's balance updated to $72",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update balance",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/60">Basic admin tools and access to advanced features</p>
        </div>

        <Tabs defaultValue="legacy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="legacy" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Balance Management
            </TabsTrigger>
            <TabsTrigger value="redirect" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Advanced Admin Tools  
            </TabsTrigger>
          </TabsList>

          {/* Legacy Tools Tab */}
          <TabsContent value="legacy" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Set User Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="balance" className="text-white">Balance ($)</Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <Button 
                    onClick={handleSetBalance}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Updating...' : 'Set Balance'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleSetKelvinBalance}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Updating...' : 'Set Kelvin Balance to $72'}
                  </Button>
                  <p className="text-sm text-white/60 mt-2">
                    Sets kelvinkelly3189@gmail.com balance to $72
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Redirect Tab */}
          <TabsContent value="redirect" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Advanced Admin Tools</CardTitle>
                <p className="text-white/60">Access comprehensive admin functionality in the dedicated admin panel</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardContent className="p-4">
                      <h3 className="text-white font-medium mb-2">Available Features</h3>
                      <ul className="text-sm text-white/70 space-y-1">
                        <li>• User Management & Analytics</li>
                        <li>• KYC Review & Documentation</li>
                        <li>• Messaging & Communications</li>
                        <li>• Security & Fraud Detection</li>
                        <li>• System Monitoring & Audit Logs</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardContent className="p-4">
                      <h3 className="text-white font-medium mb-2">Quick Access</h3>
                      <Button 
                        onClick={() => window.location.href = '/admin-kyc'}
                        className="w-full bg-blue-600 hover:bg-blue-700 mb-2"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Open Admin Panel
                      </Button>
                      <p className="text-xs text-white/60">
                        Opens the comprehensive admin dashboard with full management capabilities
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;