
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CryptoCurrencySelectorProps {
  selectedCrypto: string;
  onSelect: (crypto: string) => void;
  userBalances: Record<string, number>;
}

const cryptoList = [
  { symbol: 'BTC', name: 'Bitcoin', chainColor: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', chainColor: '#627EEA' },
  { symbol: 'USDT', name: 'Tether', chainColor: '#26A17B' },
  { symbol: 'USDC', name: 'USD Coin', chainColor: '#2775CA' },
  { symbol: 'DOGE', name: 'Dogecoin', chainColor: '#C2A633' },
  { symbol: 'SOL', name: 'Solana', chainColor: '#00FFA3' },
  { symbol: 'XRP', name: 'Ripple', chainColor: '#23292F' },
  { symbol: 'WLD', name: 'Worldcoin', chainColor: '#4940E0' },
  { symbol: 'MATIC', name: 'Polygon', chainColor: '#8247E5' },
  { symbol: 'LINK', name: 'Chainlink', chainColor: '#2A5ADA' },
  { symbol: 'ADA', name: 'Cardano', chainColor: '#0033AD' }
];

export const CryptoCurrencySelector = ({ selectedCrypto, onSelect, userBalances }: CryptoCurrencySelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {cryptoList.map((crypto) => {
        const balance = userBalances[crypto.symbol] || 0;
        const hasBalance = balance > 0;

        return (
          <motion.div
            key={crypto.symbol}
            whileHover={hasBalance ? { scale: 1.05 } : {}}
            className={cn(
              "relative group cursor-pointer",
              !hasBalance && "opacity-70"
            )}
            onClick={() => onSelect(crypto.symbol)}
          >
            <div
              className={cn(
                "rounded-xl p-4 backdrop-blur-md transition-all duration-300",
                "border bg-black/20",
                selectedCrypto === crypto.symbol 
                  ? "border-[#F2FF44]" 
                  : hasBalance 
                    ? `hover:border-[${crypto.chainColor}]` 
                    : "border-white/10",
                "flex flex-col items-center justify-center gap-3"
              )}
            >
              <div className="relative w-12 h-12">
                <img
                  src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`}
                  alt={crypto.name}
                  className="w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                  }}
                />
                {selectedCrypto === crypto.symbol && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#F2FF44] rounded-full">
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-full h-full text-black"
                    >
                      <path 
                        fill="currentColor" 
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="font-semibold text-white">
                  {crypto.symbol}
                </div>
                {hasBalance && (
                  <div className="text-sm text-white/70">
                    {balance.toFixed(4)}
                  </div>
                )}
              </div>

              {hasBalance && (
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(45deg, ${crypto.chainColor}15, transparent)`
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
