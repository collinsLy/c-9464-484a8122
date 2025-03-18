
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TradingViewChart from "@/components/TradingViewChart";

interface MarketChartProps {
  selectedSymbol: string;
  selectedTimeframe: string;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
}

export const MarketChart = ({
  selectedSymbol,
  selectedTimeframe,
  onSymbolChange,
  onTimeframeChange
}: MarketChartProps) => {
  const symbols = ['BTCUSD', 'ETHUSD', 'SOLUSD', 'BNBUSD', 'ADAUSD', 'DOTUSD'];
  const timeframes = ['1D', '1W', '1M'];

  return (
    <Card className="bg-black/40 border-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Market Chart</CardTitle>
          <div className="space-x-2">
            <div className="flex gap-2">
              {timeframes.map((timeframe) => (
                <Button
                  key={timeframe}
                  size="sm"
                  onClick={() => onTimeframeChange(timeframe)}
                  className={selectedTimeframe === timeframe 
                    ? "bg-accent text-white" 
                    : "text-white border-white/20 hover:bg-white/10"
                  }
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <TradingViewChart 
            symbol={selectedSymbol} 
            theme="dark" 
            height={400} 
            interval={selectedTimeframe}
          />
        </div>
      </CardContent>
    </Card>
  );
};
