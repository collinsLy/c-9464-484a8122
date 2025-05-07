import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { UserService } from '@/lib/user-service';
import { auth } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { getTopCoins, getCoinPrice, getCoingeckoIdFromSymbol } from '@/lib/api/coingecko';

interface CryptoConverterProps {
  onAmountChange?: (amount: number, fromCurrency: string, toCurrency: string) => void;
}

export const CryptoConverter: React.FC<CryptoConverterProps> = ({ onAmountChange }) => {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USDT');
  const [toCurrency, setToCurrency] = useState<string>('BTC');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(18);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const [userBalances, setUserBalances] = useState<Record<string, number>>({
    USDT: 0,
    BTC: 0,
    ETH: 0,
    SOL: 0,
    DOGE: 0,
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Real-time conversion rates from CoinGecko API
  const [rates, setRates] = useState<Record<string, Record<string, number>>>({});
  const [isRatesLoading, setIsRatesLoading] = useState<boolean>(true);
  
  // Supported cryptocurrencies
  const supportedCryptos = ['BTC', 'ETH', 'USDT', 'SOL', 'DOGE', 'XRP', 'ADA', 'BNB', 'MATIC', 'DOT', 'LINK', 'WLD'];
  
  // Currency mapping between symbols and CoinGecko IDs
  const coinGeckoMapping: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'SOL': 'solana',
    'DOGE': 'dogecoin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'BNB': 'binancecoin', 
    'MATIC': 'matic-network',
    'DOT': 'polkadot',
    'LINK': 'chainlink',
    'WLD': 'worldcoin'
  };

  // Fetch user balances
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = auth.currentUser?.uid || localStorage.getItem('userId');
      if (!userId) return;

      setCurrentUserId(userId);

      try {
        const userData = await UserService.getUserData(userId);
        if (userData) {
          // Extract crypto balances from user data
          const balances: Record<string, number> = {};

          // Set default balances to 0
          supportedCryptos.forEach(crypto => {
            balances[crypto] = 0;
          });

          // Set USDT balance if it exists
          if (typeof userData.balance === 'number') {
            balances['USDT'] = userData.balance;
          } else if (typeof userData.balance === 'string') {
            balances['USDT'] = parseFloat(userData.balance) || 0;
          }

          // Update with actual asset balances if they exist
          if (userData.assets) {
            Object.entries(userData.assets).forEach(([symbol, data]: [string, any]) => {
              if (supportedCryptos.includes(symbol)) {
                balances[symbol] = data.amount || 0;
              }
            });
          }

          console.log("Fetched user balances:", balances);
          setUserBalances(balances);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    // Set up a real-time listener for user data changes
    const userId = auth.currentUser?.uid || localStorage.getItem('userId');
    if (userId) {
      const unsubscribe = UserService.subscribeToUserData(userId, (userData) => {
        if (userData) {
          const balances: Record<string, number> = { ...userBalances };

          // Update USDT balance
          if (typeof userData.balance === 'number') {
            balances['USDT'] = userData.balance;
          } else if (typeof userData.balance === 'string') {
            balances['USDT'] = parseFloat(userData.balance) || 0;
          }

          // Update asset balances
          if (userData.assets) {
            Object.entries(userData.assets).forEach(([symbol, data]: [string, any]) => {
              if (supportedCryptos.includes(symbol)) {
                balances[symbol] = data.amount || 0;
              }
            });
          }

          setUserBalances(balances);
        }
      });

      return () => unsubscribe();
    }
  }, []);
  
  // Fetch initial rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsRatesLoading(true);
        
        // Initialize rates object with default 1:1 for same currencies
        const initialRates: Record<string, Record<string, number>> = {};
        supportedCryptos.forEach(from => {
          initialRates[from] = {};
          supportedCryptos.forEach(to => {
            initialRates[from][to] = from === to ? 1 : 0; // Default to 1 for same currency
          });
        });
        
        // Fetch top coins data from CoinGecko for pricing
        const topCoinsData = await getTopCoins('usd', 100);
        
        if (topCoinsData && topCoinsData.length > 0) {
          // Process the rates
          const usdRates: Record<string, number> = {};
          
          // Extract USD prices
          topCoinsData.forEach(coin => {
            const symbol = coin.symbol.toUpperCase();
            if (supportedCryptos.includes(symbol)) {
              usdRates[symbol] = coin.current_price;
            }
          });
          
          // Add special handling for USDT which should be 1:1 with USD
          usdRates['USDT'] = 1;
          
          // Calculate cross rates
          supportedCryptos.forEach(from => {
            supportedCryptos.forEach(to => {
              if (from !== to) {
                if (usdRates[from] && usdRates[to]) {
                  // Calculate cross rate through USD
                  initialRates[from][to] = usdRates[from] / usdRates[to];
                } else {
                  // Fallback to reasonable default if coin not found
                  initialRates[from][to] = 0; // Will be updated on refresh or with specific API call
                }
              }
            });
          });
          
          setRates(initialRates);
        } else {
          // Fallback to default rates if API fails
          const fallbackRates = {
            BTC: { USDT: 65000, ETH: 20, SOL: 650, DOGE: 325000 },
            ETH: { USDT: 3200, BTC: 0.05, SOL: 32, DOGE: 16000 },
            USDT: { BTC: 0.000015, ETH: 0.0003, SOL: 0.01, DOGE: 5 },
            SOL: { USDT: 100, BTC: 0.0015, ETH: 0.03, DOGE: 500 },
            DOGE: { USDT: 0.2, BTC: 0.000003, ETH: 0.00006, SOL: 0.002 },
          };
          
          // Initialize with fallback rates
          supportedCryptos.forEach(from => {
            supportedCryptos.forEach(to => {
              if (from !== to) {
                if (fallbackRates[from]?.[to]) {
                  initialRates[from][to] = fallbackRates[from][to];
                } else if (fallbackRates[to]?.[from]) {
                  initialRates[from][to] = 1 / fallbackRates[to][from];
                }
              }
            });
          });
          
          setRates(initialRates);
          toast({
            title: "Using Fallback Rates",
            description: "Could not connect to price API. Using cached rates.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        toast({
          title: "Rate Fetching Error",
          description: "Unable to fetch latest rates. Using fallback data.",
          variant: "destructive"
        });
      } finally {
        setIsRatesLoading(false);
      }
    };
    
    fetchRates();
  }, []);

  // Update conversion when amount or currencies change
  useEffect(() => {
    if (amount && !isNaN(Number(amount))) {
      try {
        handleConvert();
      } catch (error) {
        console.error("Conversion error:", error);
        setConvertedAmount(null);
      }
    } else {
      setConvertedAmount(null);
    }
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    // Reset timer when conversion happens
    if (convertedAmount !== null) {
      setTimeLeft(18);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-refresh rates when timer expires
            refreshRate();
            return 18;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [convertedAmount]);
  
  // Auto-refresh rates every 60 seconds
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      if (!isLoading) {
        refreshRate();
      }
    }, 60000); // 60 seconds
    
    return () => clearInterval(autoRefreshInterval);
  }, [isLoading, fromCurrency, toCurrency]);

  const handleConvert = () => {
    if (!amount || isNaN(Number(amount))) return;

    const numAmount = Number(amount);

    // Input validation
    if (numAmount <= 0) {
      return;
    }

    let result;

    if (fromCurrency === toCurrency) {
      result = numAmount;
    } else {
      // Check if the rate exists before using it
      if (!rates[fromCurrency] || !rates[fromCurrency][toCurrency]) {
        console.error(`Missing conversion rate from ${fromCurrency} to ${toCurrency}`);
        // Default to a 1:1 conversion if rate is missing
        result = numAmount;
      } else {
        // Apply the conversion rate
        result = numAmount * rates[fromCurrency][toCurrency];
      }
    }

    // Apply a mock fee (0.1%)
    const fee = result * 0.001;
    result = result - fee;

    setConvertedAmount(result);
    if (onAmountChange) {
      onAmountChange(numAmount, fromCurrency, toCurrency);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    // Keep the amount but reset the converted result
    setConvertedAmount(null);
  };

  const refreshRate = async () => {
    setIsLoading(true);
    
    try {
      // Get the pair we need to focus on first
      const fromId = coinGeckoMapping[fromCurrency.toLowerCase()] || fromCurrency.toLowerCase();
      const toId = coinGeckoMapping[toCurrency.toLowerCase()] || toCurrency.toLowerCase();
      
      // Get specific pair price
      let pairUpdated = false;
      
      // Attempt to get direct pair price first
      if (fromCurrency !== toCurrency) {
        try {
          const directPriceData = await getCoinPrice(fromId, toCurrency.toLowerCase());
          
          if (directPriceData && directPriceData[fromId] && 
              directPriceData[fromId][toCurrency.toLowerCase()]) {
              
            // Direct price found
            const directRate = directPriceData[fromId][toCurrency.toLowerCase()];
            const updatedRates = { ...rates };
            
            if (!updatedRates[fromCurrency]) {
              updatedRates[fromCurrency] = {};
            }
            
            updatedRates[fromCurrency][toCurrency] = directRate;
            
            // Also update inverse rate
            if (!updatedRates[toCurrency]) {
              updatedRates[toCurrency] = {};
            }
            
            updatedRates[toCurrency][fromCurrency] = 1 / directRate;
            
            setRates(updatedRates);
            pairUpdated = true;
          }
        } catch (error) {
          console.log("Could not fetch direct pair price, falling back to USD conversion");
        }
      }
      
      // If direct pair failed, try via USD
      if (!pairUpdated && fromCurrency !== toCurrency) {
        // Fetch individual USD prices
        const fromPriceData = await getCoinPrice(fromId, 'usd');
        const toPriceData = await getCoinPrice(toId, 'usd');
        
        if (fromPriceData && fromPriceData[fromId] && fromPriceData[fromId].usd &&
            toPriceData && toPriceData[toId] && toPriceData[toId].usd) {
            
          const fromUsdPrice = fromPriceData[fromId].usd;
          const toUsdPrice = toPriceData[toId].usd;
          
          // Calculate cross rate
          const crossRate = fromUsdPrice / toUsdPrice;
          
          const updatedRates = { ...rates };
          
          // Ensure objects exist
          if (!updatedRates[fromCurrency]) {
            updatedRates[fromCurrency] = {};
          }
          
          updatedRates[fromCurrency][toCurrency] = crossRate;
          
          // Also update inverse rate
          if (!updatedRates[toCurrency]) {
            updatedRates[toCurrency] = {};
          }
          
          updatedRates[toCurrency][fromCurrency] = 1 / crossRate;
          
          setRates(updatedRates);
          pairUpdated = true;
        }
      }
      
      // As fallback, fetch fresh rates for all currencies if specific pair update failed
      if (!pairUpdated) {
        const topCoinsData = await getTopCoins('usd', 50);
        
        if (topCoinsData && topCoinsData.length > 0) {
          // Process the rates
          const usdRates: Record<string, number> = {};
          const updatedRates = { ...rates };
          
          // Extract USD prices
          topCoinsData.forEach(coin => {
            const symbol = coin.symbol.toUpperCase();
            if (supportedCryptos.includes(symbol)) {
              usdRates[symbol] = coin.current_price;
            }
          });
          
          // Add special handling for USDT which should be 1:1 with USD
          usdRates['USDT'] = 1;
          
          // Calculate cross rates
          supportedCryptos.forEach(from => {
            if (!updatedRates[from]) updatedRates[from] = {};
            
            supportedCryptos.forEach(to => {
              if (from !== to) {
                if (usdRates[from] && usdRates[to]) {
                  // Calculate cross rate through USD
                  updatedRates[from][to] = usdRates[from] / usdRates[to];
                }
              }
            });
          });
          
          setRates(updatedRates);
        } else {
          throw new Error("Failed to fetch rates");
        }
      }
      
      // Update conversion with new rates
      handleConvert();
      setTimeLeft(18);
      
      toast({
        title: "Rates Updated",
        description: "Live exchange rates have been refreshed",
      });
    } catch (error) {
      console.error('Error refreshing rates:', error);
      
      // Fallback to small random changes if API fails
      const updatedRates = { ...rates };
      
      supportedCryptos.forEach(fromCrypto => {
        if (!updatedRates[fromCrypto]) return;
        
        supportedCryptos.forEach(toCrypto => {
          if (fromCrypto !== toCrypto && updatedRates[fromCrypto] && updatedRates[fromCrypto][toCrypto]) {
            const currentRate = updatedRates[fromCrypto][toCrypto];
            const fluctuation = currentRate * (0.99 + Math.random() * 0.02); // Random between -1% and +1%
            updatedRates[fromCrypto][toCrypto] = fluctuation;
          }
        });
      });
      
      setRates(updatedRates);
      handleConvert();
      
      toast({
        title: "Rate Update Fallback",
        description: "Using estimated rates due to API limitations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeLeft(18);
    }
  };

  const executeConversion = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to convert",
        variant: "destructive",
      });
      return;
    }

    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to perform conversions",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount > userBalances[fromCurrency]) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromCurrency} to perform this conversion`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting conversion process...");
      console.log("Current user balances:", userBalances);

      // Calculate final amounts
      const resultAmount = convertedAmount || (numAmount * rates[fromCurrency][toCurrency] * 0.999); // Apply 0.1% fee
      const fromAmount = numAmount;
      const toAmount = resultAmount;

      console.log(`Converting ${fromAmount} ${fromCurrency} to ${toAmount} ${toCurrency}`);

      // Get current user data
      const userData = await UserService.getUserData(currentUserId);
      if (!userData) throw new Error("User data not found");

      console.log("User data fetched:", userData);

      // Initialize assets object if it doesn't exist
      if (!userData.assets) {
        userData.assets = {};
      }

      // Create a deep copy of the assets
      const updatedAssets = JSON.parse(JSON.stringify(userData.assets || {}));

      console.log("Before update - assets:", updatedAssets);

      // Handle special case for USDT which is stored in balance field
      if (fromCurrency === 'USDT') {
        // Deduct from main balance
        const currentBalance = typeof userData.balance === 'number' 
          ? userData.balance 
          : parseFloat(userData.balance || '0');

        const newBalance = Math.max(0, currentBalance - fromAmount);

        // Update USDT balance
        userData.balance = newBalance;
      } else {
        // Ensure the fromCurrency exists in assets
        if (!updatedAssets[fromCurrency]) {
          updatedAssets[fromCurrency] = { amount: 0 };
        }

        // Deduct from fromCurrency
        updatedAssets[fromCurrency].amount = Math.max(0, 
          (updatedAssets[fromCurrency].amount || 0) - fromAmount);
      }

      // Handle adding to the target currency
      if (toCurrency === 'USDT') {
        // Add to main balance
        const currentBalance = typeof userData.balance === 'number' 
          ? userData.balance 
          : parseFloat(userData.balance || '0');

        const newBalance = currentBalance + toAmount;

        // Update USDT balance
        userData.balance = newBalance;
      } else {
        // Ensure the toCurrency exists in assets
        if (!updatedAssets[toCurrency]) {
          updatedAssets[toCurrency] = { amount: 0 };
        }

        // Add to toCurrency
        updatedAssets[toCurrency].amount = 
          (updatedAssets[toCurrency].amount || 0) + toAmount;
      }

      console.log("After update - assets:", updatedAssets);

      // Create transaction record
      const timestamp = new Date().toISOString();
      const txId = `conv-${fromCurrency}-${toCurrency}-${uuidv4().substring(0, 8)}`;

      const newTransaction = {
        txId,
        timestamp,
        type: 'Conversion',
        fromAsset: fromCurrency,
        toAsset: toCurrency,
        fromAmount,
        toAmount,
        status: 'completed',
        network: 'NATIVE',
        details: {
          conversionRate: rates[fromCurrency][toCurrency],
          fee: fromAmount * 0.001,
          processingTime: '< 1 minute'
        }
      };

      console.log("Created new transaction:", newTransaction);

      // Ensure transactions array exists
      const transactions = Array.isArray(userData.transactions) ? userData.transactions : [];

      // Prepare update data
      const updateData = {
        assets: updatedAssets,
        transactions: [newTransaction, ...transactions]
      };

      // Add balance update if USDT was involved
      if (fromCurrency === 'USDT' || toCurrency === 'USDT') {
        updateData.balance = userData.balance;
      }

      console.log("Updating user data with:", updateData);

      // Update user data with new transaction and assets
      await UserService.updateUserData(currentUserId, updateData);

      console.log("User data updated successfully");

      // Update local state balances
      const updatedBalances = { ...userBalances };

      if (fromCurrency === 'USDT') {
        updatedBalances[fromCurrency] = userData.balance;
      } else {
        updatedBalances[fromCurrency] = updatedAssets[fromCurrency]?.amount || 0;
      }

      if (toCurrency === 'USDT') {
        updatedBalances[toCurrency] = userData.balance;
      } else {
        updatedBalances[toCurrency] = updatedAssets[toCurrency]?.amount || 0;
      }

      setUserBalances(updatedBalances);

      toast({
        title: "Conversion Successful",
        description: `Successfully converted ${fromAmount.toFixed(4)} ${fromCurrency} to ${toAmount.toFixed(4)} ${toCurrency}`,
      });

      // Reset form
      setAmount('');
      setConvertedAmount(null);

    } catch (error) {
      console.error('Error executing conversion:', error);
      toast({
        title: "Conversion Failed",
        description: "There was an error processing your conversion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrencyIcon = (currency: string) => {
    return (
      <img
        src={currency === 'WLD'
          ? "https://cryptologos.cc/logos/worldcoin-org-wld-logo.svg?v=040"
          : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${currency.toLowerCase()}.svg`}
        alt={currency}
        className="w-6 h-6 rounded-full"
        onError={(e) => {
          // Fallback to specific known icons if the main source fails
          if (currency === 'DOGE') {
            e.currentTarget.src = "https://assets.coingecko.com/coins/images/5/small/dogecoin.png";
          } else if (currency === 'BTC') {
            e.currentTarget.src = "https://assets.coingecko.com/coins/images/1/small/bitcoin.png";
          } else if (currency === 'ETH') {
            e.currentTarget.src = "https://assets.coingecko.com/coins/images/279/small/ethereum.png";
          } else if (currency === 'SOL') {
            e.currentTarget.src = "https://assets.coingecko.com/coins/images/4128/small/solana.png";
          } else {
            e.currentTarget.src = "https://cryptologos.cc/logos/worldcoin-org-wld-logo.svg?v=040";
          }
        }}
      />
    );
  };

  const estimatedNetworkFee = 0.0002; // Mock network fee in BTC

  return (
    <Card className="bg-[#0F1115] border-gray-800 rounded-lg shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-white">Convert {fromCurrency} to {toCurrency}</CardTitle>
        <p className="text-xs text-gray-400 mt-1">
          Instant Conversion | 
          <span className="text-green-400"> Live CoinGecko Rates</span> | 
          {isRatesLoading ? (
            <span className="text-amber-400"> Loading rates...</span>
          ) : (
            <span> Rate locked for {timeLeft}s</span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white">From</label>
              <span className="text-xs text-white">Available Balance: {(userBalances[fromCurrency] || 0).toFixed(4)} {fromCurrency}</span>
            </div>
            <div className="flex relative">
              <Input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.01 - 4,700,000"
                className="bg-background border-gray-700 text-white rounded-full h-12 pr-28"
                disabled={isLoading}
              />
              <div className="absolute right-0 top-0 h-full flex items-center pr-4">
                <Select 
                  value={fromCurrency} 
                  onValueChange={setFromCurrency}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-0 bg-transparent text-white w-auto p-0 focus:ring-0">
                    <div className="flex items-center gap-2">
                      {getCurrencyIcon(fromCurrency)}
                      <span className="font-medium">{fromCurrency}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {supportedCryptos.map(crypto => (
                      <SelectItem key={crypto} value={crypto} className="text-white hover:bg-gray-800">
                        <div className="flex items-center gap-2">
                          {getCurrencyIcon(crypto)}
                          <span>{crypto}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              className="rounded-full h-10 w-10 p-0 bg-transparent hover:bg-gray-800"
              onClick={handleSwapCurrencies}
              disabled={isLoading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M7 10L12 5L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 14L12 19L7 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white">To</label>
              <span className="text-xs text-white">Available Balance: {(userBalances[toCurrency] || 0).toFixed(4)} {toCurrency}</span>
            </div>
            <div className="flex relative">
              <Input
                type="text"
                value={convertedAmount !== null ? convertedAmount.toFixed(4) : '0'}
                readOnly
                placeholder="0"
                className="bg-background border-gray-700 text-white rounded-full h-12 pr-28"
              />
              <div className="absolute right-0 top-0 h-full flex items-center pr-4">
                <Select 
                  value={toCurrency} 
                  onValueChange={setToCurrency}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-0 bg-transparent text-white w-auto p-0 focus:ring-0">
                    <div className="flex items-center gap-2">
                      {getCurrencyIcon(toCurrency)}
                      <span className="font-medium">{toCurrency}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {supportedCryptos.map(crypto => (
                      <SelectItem key={crypto} value={crypto} className="text-white hover:bg-gray-800">
                        <div className="flex items-center gap-2">
                          {getCurrencyIcon(crypto)}
                          <span>{crypto}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Fee information */}
          {convertedAmount !== null && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between text-white">
                <span>Rate:</span>
                <span>1 {fromCurrency} = {rates[fromCurrency]?.[toCurrency] ? rates[fromCurrency][toCurrency].toFixed(4) : '...'} {toCurrency}</span>
                {isRatesLoading && <span className="text-amber-400 text-xs ml-1">(updating)</span>}
              </div>
              <div className="flex justify-between text-white">
                <span>Network Fee:</span>
                <span>≈ {estimatedNetworkFee.toFixed(4)} {toCurrency}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Slippage Tolerance:</span>
                <span>0.5%</span>
              </div>
              <div className="flex justify-between text-white font-medium">
                <span>You'll receive:</span>
                <span>{(convertedAmount - estimatedNetworkFee).toFixed(4)} {toCurrency}</span>
              </div>
            </div>
          )}

          <Button 
            onClick={executeConversion} 
            className="w-full bg-[#F2FF44] hover:bg-[#E2EF34] text-black font-medium rounded-full py-6 h-12"
            disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0 || isLoading || Number(amount) > userBalances[fromCurrency]}
          >
            {isLoading ? "Converting..." : !amount ? "Enter an amount" : 
             Number(amount) > userBalances[fromCurrency] ? `Insufficient ${fromCurrency}` : "Convert Now"}
          </Button>

          <Button 
            onClick={refreshRate} 
            variant="outline" 
            className="w-full border border-gray-700 text-white hover:bg-gray-800 rounded-full h-12"
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : isRatesLoading ? "Loading Rates..." : "Refresh Live Rates"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};