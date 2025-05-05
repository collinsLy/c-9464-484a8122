
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CryptoCurrencySelectorProps {
  cryptocurrencies: { symbol: string; name: string }[];
  selectedCrypto: string;
  onSelect: (symbol: string) => void;
  showBalance?: boolean;
  balances?: Record<string, number>;
  className?: string;
  compact?: boolean;
}

export const CryptoCurrencySelector: React.FC<CryptoCurrencySelectorProps> = ({
  cryptocurrencies,
  selectedCrypto,
  onSelect,
  showBalance = false,
  balances = {},
  className,
  compact = false,
}) => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className={cn("w-full", className)}>
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {cryptocurrencies.map((crypto) => {
          const balance = balances[crypto.symbol] || 0;
          const hasBalance = balance > 0;
          
          return (
            <motion.div
              key={crypto.symbol}
              variants={item}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(crypto.symbol)}
              className={cn(
                "relative overflow-hidden rounded-xl backdrop-blur-md cursor-pointer transition-all duration-300",
                "border border-white/10 shadow-lg",
                selectedCrypto === crypto.symbol 
                  ? "bg-white/15 border-[#F2FF44]/50" 
                  : "bg-white/5 hover:bg-white/10",
                compact ? "p-3" : "p-4"
              )}
            >
              <div className={cn(
                "flex flex-col items-center justify-center relative z-10",
                compact ? "gap-1" : "gap-2"
              )}>
                <div className={cn(
                  "relative rounded-full overflow-hidden flex items-center justify-center",
                  compact ? "w-8 h-8" : "w-12 h-12"
                )}>
                  <img 
                    src={crypto.symbol === 'WLD' 
                      ? "https://cryptologos.cc/logos/worldcoin-org-wld-logo.svg?v=040" 
                      : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`} 
                    alt={crypto.symbol} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                    }}
                  />
                </div>
                
                <div className={compact ? "text-sm font-medium" : "text-base font-medium"}>
                  {crypto.symbol}
                </div>
                
                {showBalance && (
                  <div className={cn(
                    "text-xs mt-1",
                    hasBalance ? "text-[#4ADE80]" : "text-white/40"
                  )}>
                    {balance.toFixed(4)}
                  </div>
                )}
              </div>
              
              {/* Subtle gradient background */}
              <div className="absolute inset-0 -z-10 opacity-30 bg-gradient-to-br from-transparent via-transparent to-white/5"></div>
              
              {/* Selection indicator */}
              {selectedCrypto === crypto.symbol && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F2FF44] rounded-b-lg"></div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
