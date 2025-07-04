
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CryptoConverter } from "@/components/trading/CryptoConverter";
import { UserService } from "@/lib/user-service";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

const CryptoConverterPage = () => {
  const [conversionHistory, setConversionHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    document.title = "Crypto Converter | Vertex Trading";
  }, []);

  // Fetch conversion history
  useEffect(() => {
    const fetchConversionHistory = async () => {
      const userId = auth.currentUser?.uid || localStorage.getItem('userId');
      if (!userId) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const userData = await UserService.getUserData(userId);
        if (userData && userData.transactions) {
          // Filter for conversion transactions
          const conversions = userData.transactions
            .filter(tx => tx.type === 'Conversion')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10); // Show last 10 conversions
          
          setConversionHistory(conversions);
        }
      } catch (error) {
        console.error('Error fetching conversion history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchConversionHistory();

    // Set up real-time listener for transaction updates
    const userId = auth.currentUser?.uid || localStorage.getItem('userId');
    if (userId) {
      const unsubscribe = UserService.subscribeToUserData(userId, (userData) => {
        if (userData && userData.transactions) {
          const conversions = userData.transactions
            .filter(tx => tx.type === 'Conversion')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
          
          setConversionHistory(conversions);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const getCurrencyIcon = (currency: string) => {
    return (
      <img
        src={currency === 'WLD'
          ? "https://cryptologos.cc/logos/worldcoin-org-wld-logo.svg?v=040"
          : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${currency.toLowerCase()}.svg`}
        alt={currency}
        className="w-5 h-5 rounded-full"
        onError={(e) => {
          if (currency === 'DOGE') {
            e.currentTarget.src = "https://assets.coingecko.com/coins/images/5/small/dogecoin.png";
          } else if (currency === 'BTC') {
            e.currentTarget.src = "https://assets.coingecko.com/coins/images/1/small/bitcoin.png";
          } else if (currency === 'ETH') {
            e.currentTarget.src = "https://assets.coingecko.com/coins/images/279/small/ethereum.png";
          } else if (currency === 'SOL') {
            e.currentTarget.src = "https://assets.coingecko.com/coins/images/4128/small/solana.png";
          } else if (currency === 'USDC') {
            e.currentTarget.src = "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1624695678";
          } else {
            e.currentTarget.src = "https://cryptologos.cc/logos/worldcoin-org-wld-logo.svg?v=040";
          }
        }}
      />
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="w-full lg:w-8/12 space-y-6">
            <h1 className="text-3xl font-bold text-white">Crypto Converter</h1>
            <p className="text-white/70">
              Convert between different cryptocurrencies instantly with competitive rates and low fees.
            </p>

            <div className="bg-background/40 backdrop-blur-xl border border-white/10 rounded-lg p-4">
              <CryptoConverter />
            </div>

            <div className="bg-background/40 backdrop-blur-xl border border-white/10 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">About Crypto Conversion</h2>
              <p className="text-white/70">
                Our crypto converter allows you to swap between different cryptocurrencies directly from your Vertex Trading wallet. The conversion process is instant and secure, with competitive rates pulled from major exchanges in real-time.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="border border-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Conversion Fees</h3>
                  <p className="text-white/70">All conversions have a 0.1% fee, which is lower than most exchanges.</p>
                </div>
                <div className="border border-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Rate Updates</h3>
                  <p className="text-white/70">Rates are refreshed every 18 seconds to ensure you get the most current market prices.</p>
                </div>
                <div className="border border-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Supported Currencies</h3>
                  <p className="text-white/70">We support 12+ cryptocurrencies including BTC, ETH, USDT, SOL, DOGE, and more.</p>
                </div>
                <div className="border border-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Instant Swaps</h3>
                  <p className="text-white/70">All conversions are processed instantly with no waiting periods.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-4/12 space-y-6">
            <div className="bg-background/40 backdrop-blur-xl border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Conversion Tips</h2>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#F2FF44]">•</span>
                  <span>Check rates before converting large amounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F2FF44]">•</span>
                  <span>Convert to stablecoins during market volatility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F2FF44]">•</span>
                  <span>Use the "Max" button to convert your entire balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F2FF44]">•</span>
                  <span>Rates are locked for 18 seconds after getting a quote</span>
                </li>
              </ul>
            </div>

            <Card className="bg-background/40 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Conversion History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2FF44]"></div>
                  </div>
                ) : conversionHistory.length === 0 ? (
                  <p className="text-white/70 text-sm text-center py-8">
                    Your recent conversions will appear here after you make your first swap.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {conversionHistory.map((conversion) => (
                      <div
                        key={conversion.txId}
                        className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getCurrencyIcon(conversion.fromAsset)}
                            <span className="text-white font-medium">{conversion.fromAsset}</span>
                          </div>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <div className="flex items-center gap-2">
                            {getCurrencyIcon(conversion.toAsset)}
                            <span className="text-white font-medium">{conversion.toAsset}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white text-sm">
                            {parseFloat(conversion.fromAmount).toFixed(4)} {conversion.fromAsset} → {parseFloat(conversion.toAmount).toFixed(4)} {conversion.toAsset}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {formatDistanceToNow(new Date(conversion.timestamp), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CryptoConverterPage;
