
import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
}

export default function TradingViewChart({ symbol }: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof TradingView !== 'undefined') {
        new TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${symbol}`,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: container.current?.id,
          hide_side_toolbar: false,
          save_image: false,
          studies: ['MASimple@tv-basicstudies'],
          show_popup_button: false,
          popup_width: '1000',
          popup_height: '650',
          withdateranges: true,
          range: '1D',
        });
      }
    };

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div 
      id="tradingview_widget" 
      ref={container} 
      style={{ height: '600px', width: '100%' }}
      className="rounded-lg overflow-hidden"
    />
  );
}
