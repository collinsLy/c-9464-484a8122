
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AssetCardProps {
  symbol: string;
  amount: number;
  value: number;
  price?: number;
  change24h?: number;
  icon?: string;
  fullName?: string;
}

// Memoized component to prevent unnecessary re-renders
const AssetCard = React.memo(({ symbol, amount, value, price, change24h, icon, fullName }: AssetCardProps) => {
  const displayAmount = amount > 0 ? amount.toFixed(8) : '0.00000000';
  
  return (
    <div className="grid grid-cols-3 p-3 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-1 sm:gap-2">
        <img
          src={icon || `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${symbol.toLowerCase()}.svg`}
          alt={symbol}
          className="w-5 h-5 sm:w-6 sm:h-6"
          onError={(e) => {
            e.currentTarget.src = "https://assets.coingecko.com/coins/images/31069/small/worldcoin.jpeg";
          }}
        />
        <div>
          <div className="text-sm sm:text-base text-white">{symbol}</div>
          {fullName && (
            <div className="text-xs text-white/60 hidden sm:block">{fullName}</div>
          )}
        </div>
      </div>
      <div className="text-right text-xs sm:text-sm text-white overflow-hidden text-ellipsis">
        {displayAmount}
      </div>
      <div className="text-right text-xs sm:text-sm text-white">
        ${symbol === 'USDT' ? '1.00' : price?.toFixed(2) || '0.00'}
      </div>
    </div>
  );
});

AssetCard.displayName = 'AssetCard';

export default AssetCard;
