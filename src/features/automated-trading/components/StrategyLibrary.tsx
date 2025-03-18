
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StrategyLibraryProps {
  isDemoMode: boolean;
}

export function StrategyLibrary({ isDemoMode }: StrategyLibraryProps) {
  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <CardTitle>Strategy Library</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/70 text-sm">
          {isDemoMode 
            ? "Try our pre-built strategies with virtual funds or create your own practice strategies."
            : "Access our pre-built strategies or create your own custom trading strategies using our advanced bot configuration tools."
          }
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="text-white border-white/20 hover:bg-white/10"
            onClick={() => {
              toast("Browse our collection of pre-built trading strategies.");
            }}
          >
            Browse Strategies
          </Button>
          <Button
            onClick={() => {
              toast(isDemoMode 
                ? "Create a practice strategy with virtual funds."
                : "Create a new trading strategy for your bots."
              );
            }}
          >
            Create New Strategy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
