
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AssetCardProps {
  symbol: string;
  amount: number;
  value: number;
  price?: number;
  change24h?: number;
  icon?: string;
}

// Memoized component to prevent unnecessary re-renders
const AssetCard = React.memo(({ symbol, amount, value, price, change24h, icon }: AssetCardProps) => {
  const changeColor = change24h && change24h >= 0 ? 'text-green-400' : 'text-red-400';
  
  return (
    <div className="bg-background/40 border border-white/10 rounded-lg p-4 hover:bg-background/60 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={icon} alt={symbol} />
            <AvatarFallback className="bg-primary/20 text-white text-sm">
              {symbol.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-white font-medium">{symbol}</h3>
            {price && (
              <p className="text-white/60 text-sm">${price.toFixed(4)}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-medium">{amount.toLocaleString()}</p>
          <p className="text-white/60 text-sm">${value.toFixed(2)}</p>
          {change24h !== undefined && (
            <p className={`text-xs ${changeColor}`}>
              {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

AssetCard.displayName = 'AssetCard';

export default AssetCard;
