
import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  exchange?: 'NYSE' | 'BINANCE';
  containerId?: string;
}

export default function TradingViewChart({ symbol, exchange, containerId }: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const chartId = containerId || `tradingview_${exchange}_${symbol}`.toLowerCase();

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof TradingView !== 'undefined') {
        new TradingView.widget({
          container_id: chartId,
          autosize: true,
          symbol: exchange ? `${exchange}:${symbol}` : symbol,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          allow_symbol_change: true,
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
  }, [symbol, exchange, chartId]);

  return (
    <div 
      id={chartId}
      ref={container} 
      style={{ height: '600px', width: '100%' }}
      className="rounded-lg overflow-hidden chart-container relative z-0"
      onTouchStart={(e) => {
        // Store the initial touch position
        const touchY = e.touches[0].clientY;
        const element = e.currentTarget;
        
        // Check if the user is at the top or bottom edge of the chart
        const isAtTop = element.scrollTop === 0;
        const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight;
        
        // Add data attributes to track scroll boundaries
        element.dataset.atTop = String(isAtTop);
        element.dataset.atBottom = String(isAtBottom);
        element.dataset.touchStartY = String(touchY);
      }}
      onTouchMove={(e) => {
        const element = e.currentTarget;
        const touchY = e.touches[0].clientY;
        const startY = Number(element.dataset.touchStartY || 0);
        const isAtTop = element.dataset.atTop === 'true';
        const isAtBottom = element.dataset.atBottom === 'true';
        
        // If scrolling up at the top edge or down at the bottom edge,
        // allow the page to scroll instead of the chart
        if ((isAtTop && touchY > startY) || (isAtBottom && touchY < startY)) {
          e.stopPropagation();
        }
      }}
    />
  );
}
