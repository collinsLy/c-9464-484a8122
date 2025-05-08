import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { TransactionHistory } from "@/components/dashboard/TransactionHistory";

const HistoryPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Transaction History</h1>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposits">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                <TabsTrigger value="trades">Trades</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <TransactionHistory filter="all" />
              </TabsContent>

              <TabsContent value="deposits" className="mt-4">
                <TransactionHistory filter="deposits" />
              </TabsContent>

              <TabsContent value="withdrawals" className="mt-4">
                <TransactionHistory filter="withdrawals" />
              </TabsContent>

              <TabsContent value="trades" className="mt-4">
                <TransactionHistory filter="trades" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;