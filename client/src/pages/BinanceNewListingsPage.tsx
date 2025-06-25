
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface NewListing {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
  tradingStartTime: number;
}

export default function VertexNewListingsPage() {
  const [newListings, setNewListings] = useState<NewListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewListings = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
        const data = await response.json();
        
        // Filter symbols added in the last 7 days
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentListings = data.symbols
          .filter((symbol: any) => symbol.status === 'TRADING' && symbol.tradingStartTime > oneWeekAgo)
          .map((symbol: any) => ({
            symbol: symbol.symbol,
            baseAsset: symbol.baseAsset,
            quoteAsset: symbol.quoteAsset,
            status: symbol.status,
            tradingStartTime: symbol.tradingStartTime
          }));

        setNewListings(recentListings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching new listings:', error);
        setLoading(false);
      }
    };

    fetchNewListings();
    const interval = setInterval(fetchNewListings, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold text-white">New Cryptocurrency Listings</h1>
        
        {loading ? (
          <div className="text-white">Loading new listings...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newListings.map((listing) => (
              <Card key={listing.symbol} className="bg-background/40 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">{listing.baseAsset}/{listing.quoteAsset}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white/70">
                    <p>Symbol: {listing.symbol}</p>
                    <p>Status: {listing.status}</p>
                    <p>Listed: {new Date(listing.tradingStartTime).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
