
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionHistory from "@/components/dashboard/TransactionHistory";

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <DashboardLayout>
      <div className="space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white">History</h2>
        </div>
        <Card className="bg-background/40 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-background/40 backdrop-blur-lg border-white/10">
                <TabsTrigger value="all">All Transactions</TabsTrigger>
                <TabsTrigger value="deposits">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                <TabsTrigger value="trades">Trades</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="pt-4">
                <TransactionHistory filter="all" />
              </TabsContent>
              <TabsContent value="deposits" className="pt-4">
                <TransactionHistory filter="deposit" />
              </TabsContent>
              <TabsContent value="withdrawals" className="pt-4">
                <TransactionHistory filter="withdraw" />
              </TabsContent>
              <TabsContent value="trades" className="pt-4">
                <TransactionHistory filter="trade" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
