
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TradingViewChart from "@/components/TradingViewChart";

interface MarketChartProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const MarketChart = ({ selectedSymbol, onSymbolChange }: MarketChartProps) => {
  const symbols = ["BTCUSD", "ETHUSD", "SOLUSD", "BNBUSD", "ADAUSD", "DOTUSD"];
  
  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle>Market Chart</CardTitle>
          <div className="flex flex-wrap gap-2">
            {symbols.map((symbol) => (
              <Button 
                key={symbol}
                variant={selectedSymbol === symbol ? "default" : "outline"}
                size="sm"
                onClick={() => onSymbolChange(symbol)}
                className={selectedSymbol === symbol 
                  ? "bg-accent text-white" 
                  : "text-white border-white/20 hover:bg-white/10"
                }
              >
                {symbol}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <TradingViewChart 
            symbol={selectedSymbol} 
            theme="dark" 
            height={400} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketChart;
