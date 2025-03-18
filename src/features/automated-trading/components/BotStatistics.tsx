
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BotStatisticsProps {
  isDemoMode: boolean;
}

export function BotStatistics({ isDemoMode }: BotStatisticsProps) {
  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <CardTitle>{isDemoMode ? "Demo Bot Statistics" : "Bot Statistics"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white/70">Total Bots Active</span>
            <span className="font-medium">0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Profits Generated (24h)</span>
            <span className="font-medium text-green-400">$0.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Profits Generated (All Time)</span>
            <span className="font-medium text-green-400">$0.00</span>
          </div>
        </div>
        <Button 
          className="w-full"
          onClick={() => {
            toast(isDemoMode 
              ? "Custom strategies are available in demo mode for practice."
              : "Creating custom strategies requires a funded account."
            );
          }}
        >
          Create Custom Bot Strategy
        </Button>
      </CardContent>
    </Card>
  );
}
