
import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertService } from "@/lib/alert-service";
import PriceAlertForm from "@/components/alerts/PriceAlertForm";
import { getCoinPrice, getCoingeckoIdFromSymbol } from "@/lib/api/coingecko";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered: boolean;
}

const AlertsPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [currentTab, setCurrentTab] = useState("active");
  const [isLoading, setIsLoading] = useState(false);

  // Use React Query to fetch the latest prices for popular cryptocurrencies
  const { data: btcPrice, isLoading: btcLoading } = useQuery({
    queryKey: ['coinPrice', 'bitcoin'],
    queryFn: () => getCoinPrice('bitcoin'),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: ethPrice, isLoading: ethLoading } = useQuery({
    queryKey: ['coinPrice', 'ethereum'],
    queryFn: () => getCoinPrice('ethereum'),
    refetchInterval: 30000
  });

  const { data: solPrice, isLoading: solLoading } = useQuery({
    queryKey: ['coinPrice', 'solana'],
    queryFn: () => getCoinPrice('solana'),
    refetchInterval: 30000
  });

  // Real-time prices based on CoinGecko data
  const realTimePrices = {
    BTCUSD: btcPrice?.bitcoin?.usd || 0,
    ETHUSD: ethPrice?.ethereum?.usd || 0,
    SOLUSD: solPrice?.solana?.usd || 0,
    USDTUSD: 1.00, // Stablecoin, generally 1 USD
    WLDUSD: 2.78, // Fallback if not available from API
  };

  // Load user's alerts
  useEffect(() => {
    const unsubscribe = AlertService.getUserAlerts((fetchedAlerts) => {
      setAlerts(fetchedAlerts);
    });

    return () => unsubscribe();
  }, []);

  // Check alerts against real-time prices periodically
  useEffect(() => {
    const checkAlertsInterval = setInterval(() => {
      AlertService.checkPriceAlerts();
    }, 60000); // Check every minute

    // Initial check on page load
    AlertService.checkPriceAlerts();

    return () => clearInterval(checkAlertsInterval);
  }, []);

  // Manual check of alerts
  const checkAlerts = async () => {
    setIsLoading(true);
    try {
      await AlertService.checkPriceAlerts(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an alert
  const deleteAlert = async (alertId: string) => {
    await AlertService.deletePriceAlert(alertId);
  };

  // Filter alerts based on active tab
  const filteredAlerts = alerts.filter(alert => {
    if (currentTab === 'active') return !alert.triggered;
    return alert.triggered;
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Price Alerts</h1>
          <Button 
            variant="outline" 
            onClick={checkAlerts}
            disabled={isLoading}
            className="text-white border-white/20 hover:bg-white/10"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Alerts Now'
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(realTimePrices).map(([symbol, price]) => (
            <Card key={symbol} className="bg-background/40 backdrop-blur-lg border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">{symbol}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">
                  ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-white/70">
                  {symbol === 'BTCUSD' && btcLoading && "Updating..."}
                  {symbol === 'ETHUSD' && ethLoading && "Updating..."}
                  {symbol === 'SOLUSD' && solLoading && "Updating..."}
                  {!btcLoading && !ethLoading && !solLoading && "Live price from CoinGecko"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-background/40 backdrop-blur-lg border-white/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">My Price Alerts</CardTitle>
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-auto">
                  <TabsList className="bg-background/40">
                    <TabsTrigger value="active" className="text-white data-[state=active]:bg-white/10">
                      Active
                    </TabsTrigger>
                    <TabsTrigger value="triggered" className="text-white data-[state=active]:bg-white/10">
                      Triggered
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription className="text-white/70">
                Get notified when prices reach your target levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-white/70">
                  {currentTab === 'active' 
                    ? "You don't have any active price alerts. Create one to get started."
                    : "No triggered alerts yet."}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAlerts.map(alert => (
                    <Card key={alert.id} className="bg-background/20 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-white">{alert.symbol}</h3>
                            <p className="text-sm text-white/70">
                              Alert when price goes {alert.condition}{' '}
                              ${alert.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              Created {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {currentTab === 'triggered' ? (
                              <Badge variant="success">Triggered</Badge>
                            ) : (
                              <Badge variant="outline" className="text-white border-white/20">Active</Badge>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteAlert(alert.id)}
                              className="text-white hover:bg-white/10"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <PriceAlertForm currentPrices={realTimePrices} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;
