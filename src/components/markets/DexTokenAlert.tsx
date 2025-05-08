import React from 'react';
import { DexPair } from '@/lib/dexscreener-service';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DexTokenAlertProps {
  pair: DexPair;
}

export const DexTokenAlert: React.FC<DexTokenAlertProps> = ({ pair }) => {
  return (
    <Card className="mb-4 border border-white/10 bg-background/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{pair.token0.symbol}/{pair.token1.symbol}</h3>
          <Badge variant="outline">{pair.pairAddress.slice(0, 6)}...{pair.pairAddress.slice(-4)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Volume 24h</p>
            <p className="font-medium">${pair.volume24h}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Liquidity</p>
            <p className="font-medium">${pair.liquidity}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DexTokenAlert;