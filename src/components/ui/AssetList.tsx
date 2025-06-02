
import React, { Suspense } from 'react';
import AssetCard from './AssetCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useBalanceStore } from '@/hooks/useBalanceStore';

// Skeleton component for loading state
const AssetListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="bg-background/40 border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Memoized list component
const AssetListContent = React.memo(() => {
  const { assets, isLoading, balances } = useBalanceStore();

  // Base assets list for complete display
  const baseAssets = [
    { symbol: "BTC", fullName: "Bitcoin" },
    { symbol: "ETH", fullName: "Ethereum" },
    { symbol: "USDT", fullName: "TetherUS" },
    { symbol: "USDC", fullName: "USD Coin" },
    { symbol: "BNB", fullName: "Binance Coin" },
    { symbol: "DOGE", fullName: "Dogecoin" },
    { symbol: "SOL", fullName: "Solana" },
    { symbol: "XRP", fullName: "Ripple" },
    { symbol: "WLD", fullName: "Worldcoin" },
    { symbol: "ADA", fullName: "Cardano" },
    { symbol: "DOT", fullName: "Polkadot" },
    { symbol: "LINK", fullName: "Chainlink" },
    { symbol: "MATIC", fullName: "Polygon" }
  ];

  if (isLoading) {
    return <AssetListSkeleton />;
  }

  // Merge base assets with user's actual assets data
  const mergedAssets = baseAssets.map(baseAsset => {
    const userAsset = assets.find(a => a.symbol === baseAsset.symbol);
    return {
      ...baseAsset,
      amount: userAsset?.amount || 0,
      value: userAsset?.value || 0,
      price: userAsset?.price || balances.assetPrices[baseAsset.symbol] || 0
    };
  });

  // Sort assets: first show assets with balances, then the rest
  const sortedAssets = [...mergedAssets].sort((a, b) => {
    const aHasBalance = a.amount > 0;
    const bHasBalance = b.amount > 0;

    if (aHasBalance && !bHasBalance) return -1;
    if (!aHasBalance && bHasBalance) return 1;

    return b.value - a.value;
  });

  return (
    <div className="rounded-lg border border-white/10">
      <div className="grid grid-cols-3 p-3 text-xs sm:text-sm font-medium text-white/60">
        <div>Coin</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Price</div>
      </div>
      <div className="divide-y divide-white/10">
        {sortedAssets.map((asset, index) => (
          <AssetCard
            key={`${asset.symbol}-${index}`}
            symbol={asset.symbol}
            amount={asset.amount}
            value={asset.value}
            price={asset.price}
            fullName={asset.fullName}
          />
        ))}
      </div>
    </div>
  );
});

AssetListContent.displayName = 'AssetListContent';

// Main component with Suspense
const AssetList = () => {
  return (
    <Suspense fallback={<AssetListSkeleton />}>
      <AssetListContent />
    </Suspense>
  );
};

export default AssetList;
