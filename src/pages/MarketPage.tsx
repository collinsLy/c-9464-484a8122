import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { getTopCoins } from "@/lib/api/coingecko";
import { columns } from "@/components/markets/columns";

export default function MarketPage() {
  const { isDemoMode } = useDashboardContext();

  const { data: coins, isLoading, error } = useQuery({
    queryKey: ['top-coins'],
    queryFn: () => getTopCoins(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-red-500">Error loading market data</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Cryptocurrency Market</h1>
        <p className="text-muted-foreground">Live prices from CoinGecko</p>
        <DataTable data={coins || []} columns={columns} />
      </div>
    </DashboardLayout>
  );
}