
import { ArrowUpRight, ArrowDownRight, Wallet, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AccountOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-white/70">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$38,800.08</div>
          <div className="flex items-center mt-1 text-sm">
            <ArrowUpRight className="w-4 h-4 mr-1 text-green-400" />
            <span className="text-green-400">+3.24%</span>
            <span className="ml-1 text-white/60">today</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-white/70">Available Cash</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$5,230.45</div>
          <div className="flex mt-2">
            <Button variant="outline" size="sm" className="mr-2 text-white border-white/20 hover:bg-white/10">
              <Wallet className="w-4 h-4 mr-1" />
              Deposit
            </Button>
            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
              <CreditCard className="w-4 h-4 mr-1" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-white/70">Profit / Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-400">+$1,245.32</div>
          <div className="flex items-center mt-1 text-sm">
            <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
            <span className="text-green-400">+8.12%</span>
            <span className="ml-1 text-white/60">all time</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountOverview;
