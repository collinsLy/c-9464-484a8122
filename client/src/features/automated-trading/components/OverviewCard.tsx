
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface OverviewCardProps {
  isDemoMode: boolean;
}

export function OverviewCard({ isDemoMode }: OverviewCardProps) {
  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-6 w-6 text-accent" />
          {isDemoMode ? "Demo Automated Trading Bots" : "Automated Trading Bots"}
        </CardTitle>
        <CardDescription className="text-white/70">
          {isDemoMode 
            ? "Practice with our advanced algorithms using virtual funds. No real money is used."
            : "Let our advanced algorithms trade for you. Configure and deploy trading bots with our easy-to-use interface."
          }
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
