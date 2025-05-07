
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { PriceAlertForm } from "@/components/alerts/PriceAlertForm";

const AlertsPage = () => {
  const { isDemoMode } = useDashboardContext();

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
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;
