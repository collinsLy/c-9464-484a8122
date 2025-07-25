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

        <Tabs defaultValue="redirect" className="w-full">
          <TabsList className="grid w-full grid-cols-1 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="redirect" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Advanced Admin Tools  
            </TabsTrigger>
          </TabsList>

          {/* Redirect Tab */}
          <TabsContent value="redirect" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Advanced Admin Tools</CardTitle>
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