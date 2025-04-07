
import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';

interface CryptoPrice {
  symbol: string;
  price: string;
  priceChange: string;
}

const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'DOGEUSDT', 
  'DOTUSDT', 'MATICUSDT', 'LINKUSDT', 'XRPUSDT'
];

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
    <div className="w-full bg-[#0F1115] backdrop-blur-lg border border-white/10 rounded-lg py-4 px-2 overflow-hidden shadow-lg">
      <Marquee speed={30} gradient={false} className="[&>*]:mx-6">
        {prices.map((crypto) => (
          <div
            key={crypto.symbol}
            className="inline-flex items-center space-x-3 text-base md:text-lg"
          >
            <span className="font-medium text-white/80">{crypto.symbol}</span>
            <span className="font-bold text-white">${crypto.price}</span>
            <span
              className={`text-sm ${
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
