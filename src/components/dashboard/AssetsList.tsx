
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const assets = [
  { id: 1, name: "Bitcoin", symbol: "BTC", balance: 0.45, value: 26532.12, change: 2.34 },
  { id: 2, name: "Ethereum", symbol: "ETH", balance: 3.21, value: 9432.76, change: -1.24 },
  { id: 3, name: "Solana", symbol: "SOL", balance: 28.5, value: 1843.20, change: 5.67 },
  { id: 4, name: "Cardano", symbol: "ADA", balance: 1240, value: 992.00, change: 0.12 },
  { id: 5, name: "BNB", symbol: "BNB", balance: 4.7, value: 893.25, change: 1.35 },
];

const AssetsList = () => {
  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white h-full">
      <CardHeader>
        <CardTitle>Your Assets</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="space-y-4">
          {assets.map((asset) => (
            <div 
              key={asset.id} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                  {asset.symbol.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{asset.name}</div>
                  <div className="text-sm text-white/60">{asset.balance} {asset.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">${asset.value.toLocaleString()}</div>
                <div className={`text-sm flex items-center justify-end ${asset.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.change > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {asset.change > 0 ? '+' : ''}{asset.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetsList;
