
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionHistory from "@/components/dashboard/TransactionHistory";

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <DashboardLayout>
      <div className="w-full space-y-4 px-2 sm:px-4 md:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white break-words">History</h2>
        </div>
        <Card className="w-full bg-background/40 backdrop-blur-lg border-white/10">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-lg sm:text-xl break-words">Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4 bg-background/40 backdrop-blur-lg border-white/10">
                <TabsTrigger value="all" className="text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis">All Transactions</TabsTrigger>
                <TabsTrigger value="deposits" className="text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawals" className="text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Withdrawals</TabsTrigger>
                <TabsTrigger value="trades" className="text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Trades</TabsTrigger>
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
