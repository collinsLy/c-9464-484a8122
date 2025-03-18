import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserData } from '@/hooks/useUserData';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { MarketChart } from '@/components/markets/MarketChart';
import { AccountOverview } from '@/components/dashboard/AccountOverview';
import { TradingPanel } from '@/components/trading/TradingPanel';

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const { userData, loading } = useUserData();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AccountOverview balance={userData?.balance || 0} />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <MarketChart
              selectedSymbol={selectedSymbol}
              selectedTimeframe={selectedTimeframe}
              onSymbolChange={setSelectedSymbol}
              onTimeframeChange={setSelectedTimeframe}
            />
          </div>
          <div className="xl:col-span-1">
            <TradingPanel symbol={selectedSymbol} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;