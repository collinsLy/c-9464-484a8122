
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { PriceAlertForm } from "@/components/alerts/PriceAlertForm";
import { AlertService } from "@/lib/alert-service";
import { Button } from "@/components/ui/button";

const AlertsPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [currentPrices, setCurrentPrices] = useState({
    BTCUSD: 65432.21,
    ETHUSD: 3245.67,
    SOLUSD: 152.43,
    USDTUSD: 1.00,
    WLDUSD: 2.78,
  });

  // Simulate price changes every 5 seconds for testing alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrices(prev => {
        const newPrices = { ...prev };
        
        // Generate random price changes (±2%)
        Object.keys(newPrices).forEach(symbol => {
          const change = (Math.random() * 4 - 2) / 100; // -2% to +2%
          newPrices[symbol as keyof typeof newPrices] = 
            +(newPrices[symbol as keyof typeof newPrices] * (1 + change)).toFixed(2);
        });
        
        // Check alerts against new prices
        AlertService.checkPriceAlerts(newPrices);
        
        return newPrices;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Trigger a manual check of alerts
  const checkAlerts = () => {
    AlertService.checkPriceAlerts(currentPrices);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Price Alerts</h1>
            <p className="text-sm text-white/70 mt-1">Set alerts for price movements</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(currentPrices).map(([symbol, price]) => (
            <Card key={symbol} className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span>{symbol.replace('USD', '')}</span>
                  <span className="text-lg font-bold">${price.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <PriceAlertForm />

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>How Alerts Work</CardTitle>
            <CardDescription className="text-white/70">
              Our alert system monitors market prices 24/7
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-lg font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Set Your Conditions</h3>
                  <p className="text-white/70">Choose a cryptocurrency, set a price threshold, and select whether you want to be alerted when the price goes above or below that threshold.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-lg font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">We Monitor the Market</h3>
                  <p className="text-white/70">Our system continuously monitors market prices across multiple exchanges to ensure accuracy.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-lg font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Get Notified</h3>
                  <p className="text-white/70">When your conditions are met, you'll receive an instant notification so you can take action right away.</p>
                </div>
              </div>

              {isDemoMode && (
                <Button 
                  onClick={checkAlerts} 
                  className="mt-4 bg-accent hover:bg-accent/90 text-white"
                >
                  Test Alerts (Demo Mode)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;
