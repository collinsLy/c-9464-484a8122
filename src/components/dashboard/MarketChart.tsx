
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
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white relative z-10">
      <CardHeader className="p-3 md:p-6">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <CardTitle className="text-lg md:text-2xl">Market Chart</CardTitle>
            <div className="flex flex-wrap gap-1">
              {symbols.map((symbol) => (
                <Button 
                  key={symbol}
                  variant={selectedSymbol === symbol ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSymbolChange(symbol)}
                  className={`text-xs md:text-sm px-2 py-1 ${selectedSymbol === symbol 
                    ? "bg-accent text-white" 
                    : "text-white border-white/20 hover:bg-white/10"
                  }`}
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="grid grid-cols-7 gap-1">
              {timeframes.map((timeframe) => (
                <Button 
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeframeChange(timeframe)}
                  className={`text-xs md:text-sm px-1 py-0.5 ${selectedTimeframe === timeframe 
                    ? "bg-accent text-white" 
                    : "text-white border-white/20 hover:bg-white/10"
                  }`}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 md:p-6">
        <div className="h-[300px] md:h-[600px]">
          <TradingViewChart 
            symbol={selectedSymbol} 
            theme="dark" 
            height="100%" 
            interval={selectedTimeframe}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketChart;
