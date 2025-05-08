import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Users, Star, TrendingUp, Copy } from "lucide-react";

const SocialTradingPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white">Social Trading</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Top Traders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">Follow and copy successful traders</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Browse Traders</Button>
            </CardFooter>
          </Card>

          <Card className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>Popular Strategies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">Discover trending trading strategies</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Strategies</Button>
            </CardFooter>
          </Card>

          <Card className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                <span>Copy Trading</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">Automatically copy expert traders</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Start Copying</Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle>Your Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-white/70">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Connect your account to start social trading</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SocialTradingPage;