
import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';

interface CryptoPrice {
  symbol: string;
  price: string;
  priceChange: string;
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];

export function CryptoTicker() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connectWebSocket = () => {
    const websocket = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const relevantPrices = data
        .filter((item: any) => SYMBOLS.includes(item.s))
        .map((item: any) => ({
          symbol: item.s.replace('USDT', ''),
          price: parseFloat(item.c).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }),
          priceChange: parseFloat(item.P).toFixed(2)
        }));
      setPrices(relevantPrices);
    };

    websocket.onclose = () => {
      setTimeout(connectWebSocket, 5000);
    };

    setWs(websocket);
  };

  useEffect(() => {
    connectWebSocket();
    return () => ws?.close();
  }, []);

  return (
    <div className="w-full bg-black/40 backdrop-blur-lg border-t border-b border-white/10 py-3 overflow-hidden">
      <Marquee speed={40} gradient={false} className="[&>*]:mx-4">
        {prices.map((crypto) => (
          <div
            key={crypto.symbol}
            className="inline-flex items-center space-x-2 text-sm md:text-base"
          >
            <span className="font-medium text-white/70">{crypto.symbol}</span>
            <span className="font-bold text-white">${crypto.price}</span>
            <span
              className={`text-xs ${
                parseFloat(crypto.priceChange) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {parseFloat(crypto.priceChange) >= 0 ? '+' : ''}{crypto.priceChange}%
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
