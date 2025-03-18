
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TradingViewChart from "@/components/TradingViewChart";

interface MarketChartProps {
  selectedSymbol: string;
  selectedTimeframe: string;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
}

const MarketChart = ({ 
  selectedSymbol, 
  selectedTimeframe,
  onSymbolChange, 
  onTimeframeChange 
}: MarketChartProps) => {
  const symbols = ["BTCUSD", "ETHUSD", "SOLUSD", "BNBUSD", "ADAUSD", "DOTUSD"];
  const timeframes = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"];
  
  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <div className="flex flex-col space-y-4">
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
          
          <div className="flex justify-end">
            <div className="flex flex-wrap gap-2">
              {timeframes.map((timeframe) => (
                <Button 
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
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

export default MarketChart;
