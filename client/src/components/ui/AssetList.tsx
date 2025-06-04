
import React, { memo, Suspense, useMemo } from 'react';
import { useBalanceStore } from '@/hooks/useBalanceStore';
import AssetCard from './AssetCard';

// Skeleton component for loading state
const AssetListSkeleton = () => (
  <div className="rounded-lg border border-white/10">
    <div className="grid grid-cols-3 p-3 text-xs sm:text-sm font-medium text-white/60">
      <div>Coin</div>
      <div className="text-right">Amount</div>
      <div className="text-right">Price</div>
    </div>
    <div className="divide-y divide-white/10">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-full"></div>
              <div>
                <div className="w-16 h-4 bg-white/10 rounded mb-1"></div>
                <div className="w-12 h-3 bg-white/10 rounded"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="w-20 h-4 bg-white/10 rounded mb-1"></div>
              <div className="w-16 h-3 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Memoized content component
const AssetListContent = memo(() => {
  const { balances, assets, isLoading } = useBalanceStore();

  // Base assets list
  const baseAssets = useMemo(() => [
    { name: "BTC", symbol: "BTC", fullName: "Bitcoin" },
    { name: "ETH", symbol: "ETH", fullName: "Ethereum" },
    { name: "USDT", symbol: "USDT", fullName: "TetherUS" },
    { name: "USDC", symbol: "USDC", fullName: "USD Coin" },
    { name: "BNB", symbol: "BNB", fullName: "Binance Coin" },
    { name: "DOGE", symbol: "DOGE", fullName: "Dogecoin" },
    { name: "SOL", symbol: "SOL", fullName: "Solana" },
    { name: "XRP", symbol: "XRP", fullName: "Ripple" },
    { name: "WLD", symbol: "WLD", fullName: "Worldcoin" },
    { name: "ADA", symbol: "ADA", fullName: "Cardano" },
    { name: "DOT", symbol: "DOT", fullName: "Polkadot" },
    { name: "LINK", symbol: "LINK", fullName: "Chainlink" },
    { name: "MATIC", symbol: "MATIC", fullName: "Polygon" }
  ], []);

  // Merge and sort assets
  const sortedAssets = useMemo(() => {
    if (!balances) return [];

    const assetList = baseAssets.map(asset => {
      const userAsset = balances.userAssets[asset.symbol];
      const amount = userAsset ? userAsset.amount : (asset.symbol === 'USDT' ? balances.usdtBalance : 0);
      const price = balances.assetPrices[asset.symbol] || 0;
      const value = amount * price;

      return {
        ...asset,
        amount: amount.toFixed(8),
        value,
        price
      };
    });

    // Sort: assets with balances first, then by value
    return assetList.sort((a, b) => {
      const aHasBalance = parseFloat(a.amount) > 0;
      const bHasBalance = parseFloat(b.amount) > 0;

      if (aHasBalance && !bHasBalance) return -1;
      if (!aHasBalance && bHasBalance) return 1;

      return b.value - a.value;
    });
  }, [baseAssets, balances]);

  if (isLoading) {
    return <AssetListSkeleton />;
  }

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
