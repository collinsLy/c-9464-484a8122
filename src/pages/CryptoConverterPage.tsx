
import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CryptoConverter } from "@/components/trading/CryptoConverter";

const CryptoConverterPage = () => {
  useEffect(() => {
    document.title = "Crypto Converter | Vertex Trading";
  }, []);

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
            
            <div className="bg-background/40 backdrop-blur-xl border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Conversion History</h2>
              <p className="text-white/70 text-sm">
                Your recent conversions will appear here after you make your first swap.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CryptoConverterPage;
