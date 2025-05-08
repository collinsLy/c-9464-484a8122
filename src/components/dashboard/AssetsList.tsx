
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardContext } from './DashboardLayout';
import { getCoinPrice } from '@/lib/api/coingecko';
import { auth } from '@/lib/firebase';
import { UserService } from '@/lib/firebase-service';
import { ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  logoUrl?: string;
}

export function AssetsList() {
  const { isDemoMode } = useDashboardContext();
  const [liveAssets, setLiveAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  // Demo assets for demonstration
  const demoAssets: Asset[] = [
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      balance: 0.057,
      value: 0, // Will be calculated based on price
      logoUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      balance: 1.25,
      value: 0, // Will be calculated based on price
      logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
    },
    {
      id: 'usdt',
      name: 'Tether',
      symbol: 'USDT',
      balance: 2500,
      value: 2500,
      logoUrl: 'https://assets.coingecko.com/coins/images/325/large/Tether.png'
    },
    {
      id: 'sol',
      name: 'Solana',
      symbol: 'SOL',
      balance: 12.5,
      value: 0, // Will be calculated based on price
      logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
    },
    {
      id: 'bnb',
      name: 'Binance Coin',
      symbol: 'BNB',
      balance: 3.75,
      value: 0, // Will be calculated based on price
      logoUrl: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png'
    }
  ];

  // Fetch crypto prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = ['bitcoin', 'ethereum', 'solana', 'binancecoin'];
        const prices: Record<string, number> = {};
        
        for (const symbol of symbols) {
          const price = await getCoinPrice(symbol);
          prices[symbol] = price?.usd || 0;
        }
        
        setAssetPrices({
          btc: prices.bitcoin,
          eth: prices.ethereum,
          usdt: 1, // Stablecoin
          sol: prices.solana,
          bnb: prices.binancecoin
        });
      } catch (error) {
        console.error('Error fetching prices:', error);
        // Fallback values
        setAssetPrices({
          btc: 58000,
          eth: 3100,
          usdt: 1,
          sol: 125,
          bnb: 580
        });
      }
    };
    
    fetchPrices();
    
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate asset values based on prices
  useEffect(() => {
    if (Object.keys(assetPrices).length === 0) return;
    
    // Update demo assets with real prices
    const updatedDemoAssets = demoAssets.map(asset => ({
      ...asset,
      value: asset.balance * (assetPrices[asset.id] || 0)
    }));
    
    // If not in demo mode, fetch real user assets
    if (!isDemoMode && auth.currentUser) {
      fetchUserAssets();
    } else {
      setLiveAssets([]);
      setIsLoading(false);
    }
  }, [isDemoMode, assetPrices]);

  // Fetch real user assets from Firebase
  const fetchUserAssets = async () => {
    setIsLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      const userData = await UserService.getUserData(userId);
      if (!userData || !userData.assets) {
        setLiveAssets([]);
        setIsLoading(false);
        return;
      }
      
      // Convert user assets to the format we need
      const userAssets: Asset[] = [];
      for (const [id, assetData] of Object.entries(userData.assets)) {
        if (typeof assetData === 'object' && assetData !== null) {
          const asset = assetData as {
            name: string;
            symbol: string;
            balance: number;
            logoUrl?: string;
          };
          
          userAssets.push({
            id,
            name: asset.name || id,
            symbol: asset.symbol || id.toUpperCase(),
            balance: asset.balance || 0,
            value: (asset.balance || 0) * (assetPrices[id] || 0),
            logoUrl: asset.logoUrl
          });
        }
      }
      
      setLiveAssets(userAssets);
    } catch (error) {
      console.error('Error fetching user assets:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const assets = isDemoMode ? 
    // Update demo assets with current prices
    demoAssets.map(asset => ({
      ...asset,
      value: asset.balance * (assetPrices[asset.id] || 0)
    })) : 
    liveAssets;
  
  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white h-full">
      <CardHeader>
        <CardTitle>{isDemoMode ? "Demo Assets" : "Your Assets"}</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        {isLoading ? (
          <div className="text-center py-4">Loading assets...</div>
        ) : assets.length > 0 ? (
          <div className="space-y-4">
            {assets.map((asset) => (
              <div 
                key={asset.id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center">
                  {asset.logoUrl ? (
                    <img src={asset.logoUrl} alt={asset.symbol} className="w-8 h-8 rounded-full mr-3" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                      {asset.symbol.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-white/60">{asset.balance.toFixed(2)} {asset.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full mt-4 border-dashed border-white/20 text-white/60 hover:text-white hover:bg-white/5"
              onClick={() => navigate('/deposit')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Assets
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <p className="text-white/60">No assets found</p>
            <Button 
              variant="outline" 
              className="border-dashed border-white/20 text-white/60 hover:text-white hover:bg-white/5"
              onClick={() => navigate('/deposit')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Assets
            </Button>
          </div>
        )}
        
        {assets.length > 0 && (
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-white/60 hover:text-white"
            onClick={() => navigate('/assets')}
          >
            View All Assets
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default AssetsList;
