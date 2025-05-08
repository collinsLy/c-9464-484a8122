
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TokenAlert {
  id: string;
  token: string;
  price: number;
  isAbove: boolean;
  isActive: boolean;
}

export function DexTokenAlert() {
  const [alerts, setAlerts] = useState<TokenAlert[]>([]);
  const [newToken, setNewToken] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [isAbove, setIsAbove] = useState(true);

  const handleAddAlert = () => {
    if (!newToken || !newPrice) {
      toast.error("Please enter both token symbol and price");
      return;
    }

    if (isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const newAlert: TokenAlert = {
      id: Date.now().toString(),
      token: newToken.toUpperCase(),
      price: parseFloat(newPrice),
      isAbove,
      isActive: true
    };

    setAlerts([...alerts, newAlert]);
    toast.success(`Alert set for ${newToken.toUpperCase()} ${isAbove ? 'above' : 'below'} $${newPrice}`);
    
    // Reset form
    setNewToken("");
    setNewPrice("");
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Token Price Alerts
        </CardTitle>
        <CardDescription className="text-white/70">
          Get notified when tokens reach your target price
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Token (e.g. BTC)"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              className="bg-background/40 backdrop-blur-lg border-white/10 text-white"
            />
            <Input
              placeholder="Price in $"
              type="number"
              min="0"
              step="0.000001"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="bg-background/40 backdrop-blur-lg border-white/10 text-white"
            />
            <div className="flex items-center space-x-2">
              <Switch 
                id="price-direction" 
                checked={isAbove} 
                onCheckedChange={setIsAbove}
              />
              <Label htmlFor="price-direction">{isAbove ? "Above" : "Below"}</Label>
            </div>
            <Button onClick={handleAddAlert} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Add Alert
            </Button>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-4 text-white/70">
              No price alerts set. Add one above.
            </div>
          ) : (
            <div className="space-y-2 mt-4">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex justify-between items-center p-3 rounded-md bg-background/60 border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={alert.isActive} 
                      onCheckedChange={() => toggleAlert(alert.id)}
                    />
                    <span className="font-medium">{alert.token}</span>
                    <Badge variant={alert.isAbove ? "default" : "destructive"}>
                      {alert.isAbove ? "Above" : "Below"} ${alert.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeAlert(alert.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
