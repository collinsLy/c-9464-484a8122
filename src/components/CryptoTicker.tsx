
import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';

interface CryptoPrice {
  symbol: string;
  price: string;
  priceChange: string;
}

const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 
  'DOGEUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT', 'XRPUSDT'
];

export function CryptoTicker() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connectWebSocket = () => {
    if (ws) {
      ws.close();
    }

    const websocket = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const relevantPrices = data
        .filter((item: any) => SYMBOLS.includes(item.s))
        .map((item: any) => ({
          symbol: item.s.replace('USDT', ''),
          price: parseFloat(item.c).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }),
          priceChange: parseFloat(item.P).toFixed(2)
        }));
      setPrices(relevantPrices);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting...');
      setTimeout(connectWebSocket, 5000);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      websocket.close();
    };

    setWs(websocket);
  };

  useEffect(() => {
    connectWebSocket();
    return () => ws?.close();
  }, []);

  return (
    <div className="w-full bg-background/40 backdrop-blur-lg border-t border-b border-white/10 py-4 px-2 overflow-hidden shadow-xl">
      <Marquee
        speed={40}
        gradient={false}
        pauseOnHover
        play={true}
        delay={0}
        className="[&>*]:mx-4"
      >
        {prices.map((crypto) => (
          <div
            key={crypto.symbol}
            className="inline-flex items-center space-x-3 text-sm md:text-base lg:text-lg"
          >
            <span className="font-semibold text-white/90">{crypto.symbol}</span>
            <span className="font-bold text-white">{crypto.price}</span>
            <span
              className={`${
                parseFloat(crypto.priceChange) >= 0 
                ? 'text-green-400' 
                : 'text-red-400'
              } font-medium`}
            >
              {parseFloat(crypto.priceChange) >= 0 ? '+' : ''}{crypto.priceChange}%
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
