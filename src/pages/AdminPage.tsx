
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { setUserBalance, setKelvinBalance } from '@/lib/set-user-balance';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
          description: "Kelvin's balance set to $72",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update Kelvin's balance",
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
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-white/60">Manage user balances</p>
        </div>

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
      </div>
    </DashboardLayout>
  );
}
