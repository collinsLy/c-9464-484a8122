
import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  interval?: string;
  chartType?: string;
}

const TradingViewChart = ({
  symbol = 'BTCUSD',
  theme = 'dark',
  width = '100%',
  height = 400,
  interval = '1D',
  chartType = 'candlestick'
}: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined' && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: theme,
          style: chartType,
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_top_toolbar: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
        });
      }
    };
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [symbol, theme, interval, chartType]);
  
  return (
    <div 
      id={`tradingview_${symbol.toLowerCase()}`} 
      ref={containerRef} 
      style={{ width, height }}
      className="rounded-xl overflow-hidden"
    />
  );
};

export default TradingViewChart;
