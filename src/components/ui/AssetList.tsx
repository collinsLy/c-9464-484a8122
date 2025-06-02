
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
  const { assets, isLoading } = useBalanceStore();

  if (isLoading) {
    return <AssetListSkeleton />;
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60">No assets found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assets.map((asset, index) => (
        <AssetCard
          key={`${asset.symbol}-${index}`}
          symbol={asset.symbol}
          amount={asset.amount}
          value={asset.value}
        />
      ))}
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
