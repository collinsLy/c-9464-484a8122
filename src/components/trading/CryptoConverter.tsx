
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { UserService } from '@/lib/user-service';
import { auth } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';

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

  // Supported cryptocurrencies
  const supportedCryptos = ['BTC', 'ETH', 'USDT', 'SOL', 'DOGE', 'XRP', 'ADA', 'BNB', 'MATIC', 'DOT', 'LINK', 'WLD'];

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

  // Mock conversion rates - in a real app, these would come from an API
  // Define exchange rates between pairs
  const [rates, setRates] = useState(() => {
    // Create a complete matrix of all currency pairs
    const initialRates: Record<string, Record<string, number>> = {};
    const supportedSymbols = ['BTC', 'ETH', 'USDT', 'SOL', 'DOGE', 'USD', 'XRP', 'ADA', 'BNB', 'MATIC', 'DOT', 'LINK', 'WLD'];
    
    // Set base rates
    const baseRates = {
      BTC: { USD: 65000, ETH: 20, USDT: 65000, SOL: 650, DOGE: 325000 },
      ETH: { USD: 3200, BTC: 0.05, USDT: 3200, SOL: 32, DOGE: 16000 },
      USDT: { USD: 1, BTC: 0.000015, ETH: 0.0003, SOL: 0.01, DOGE: 5 },
      SOL: { USD: 100, BTC: 0.0015, ETH: 0.03, USDT: 100, DOGE: 500 },
      DOGE: { USD: 0.2, BTC: 0.000003, ETH: 0.00006, USDT: 0.2, SOL: 0.002 },
      USD: { BTC: 0.000015, ETH: 0.0003, USDT: 1, SOL: 0.01, DOGE: 5 },
      XRP: { USD: 0.5, USDT: 0.5, BTC: 0.0000077 },
      ADA: { USD: 0.35, USDT: 0.35, BTC: 0.0000054 },
      BNB: { USD: 580, USDT: 580, BTC: 0.0089 },
      MATIC: { USD: 0.6, USDT: 0.6, BTC: 0.0000092 },
      DOT: { USD: 5.8, USDT: 5.8, BTC: 0.000089 },
      LINK: { USD: 15, USDT: 15, BTC: 0.00023 },
      WLD: { USD: 3.2, USDT: 3.2, BTC: 0.000049 },
    };
    
    // Initialize complete rate matrix with defaults
    supportedSymbols.forEach(fromSymbol => {
      initialRates[fromSymbol] = {};
      supportedSymbols.forEach(toSymbol => {
        if (fromSymbol === toSymbol) {
          initialRates[fromSymbol][toSymbol] = 1; // Same currency conversion is 1:1
        } else if (baseRates[fromSymbol]?.[toSymbol]) {
          initialRates[fromSymbol][toSymbol] = baseRates[fromSymbol][toSymbol];
        } else if (baseRates[toSymbol]?.[fromSymbol]) {
          // Use inverse if direct rate not available
          initialRates[fromSymbol][toSymbol] = 1 / baseRates[toSymbol][fromSymbol];
        } else if (baseRates[fromSymbol]?.USDT && baseRates[toSymbol]?.USDT) {
          // Calculate via USDT if both have USDT rate
          initialRates[fromSymbol][toSymbol] = baseRates[fromSymbol].USDT / baseRates[toSymbol].USDT;
        } else {
          // Fallback to a reasonable default
          initialRates[fromSymbol][toSymbol] = 1;
        }
      });
    });
    
    return initialRates;
  });

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
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [convertedAmount]);

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

  const refreshRate = () => {
    // In a real app, this would fetch fresh rates from an API
    setIsLoading(true);
    
    // Simulate a network request with a small delay
    setTimeout(() => {
      // Add some random fluctuation to rates (±2%) to simulate market movement
      const updatedRates = { ...rates };
      
      supportedCryptos.forEach(fromCrypto => {
        supportedCryptos.forEach(toCrypto => {
          if (fromCrypto !== toCrypto && rates[fromCrypto] && rates[fromCrypto][toCrypto]) {
            const currentRate = rates[fromCrypto][toCrypto];
            const fluctuation = currentRate * (0.98 + Math.random() * 0.04); // Random between -2% and +2%
            updatedRates[fromCrypto][toCrypto] = fluctuation;
          }
        });
      });
      
      setRates(updatedRates);
      handleConvert();
      setTimeLeft(18);
      setIsLoading(false);
      
      toast({
        title: "Rates Updated",
        description: "Exchange rates have been refreshed",
      });
    }, 800);
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
        description: `Successfully converted ${fromAmount.toFixed(8)} ${fromCurrency} to ${toAmount.toFixed(8)} ${toCurrency}`,
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
    switch (currency) {
      case 'BTC':
        return (
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white font-bold">
            ₿
          </div>
        );
      case 'USDT':
        return (
          <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-xs text-white font-bold">
            T
          </div>
        );
      case 'ETH':
        return (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold">
            Ξ
          </div>
        );
      case 'SOL':
        return (
          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white font-bold">
            S
          </div>
        );
      case 'DOGE':
        return (
          <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs text-white font-bold">
            D
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs text-white font-bold">
            ?
          </div>
        );
    }
  };

  const estimatedNetworkFee = 0.0002; // Mock network fee in BTC

  return (
    <Card className="bg-[#0F1115] border-gray-800 rounded-lg shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-white">Convert {fromCurrency} to {toCurrency}</CardTitle>
        <p className="text-xs text-gray-400 mt-1">Instant Conversion | Real-Time Rates | Rate locked for {timeLeft}s</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white">From</label>
              <span className="text-xs text-white">Available Balance: {(userBalances[fromCurrency] || 0).toFixed(8)} {fromCurrency}</span>
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
              <span className="text-xs text-white">Available Balance: {(userBalances[toCurrency] || 0).toFixed(8)} {toCurrency}</span>
            </div>
            <div className="flex relative">
              <Input
                type="text"
                value={convertedAmount !== null ? convertedAmount.toFixed(8) : '0'}
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
                <span>1 {fromCurrency} = {rates[fromCurrency][toCurrency].toFixed(8)} {toCurrency}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Network Fee:</span>
                <span>≈ {estimatedNetworkFee.toFixed(8)} {toCurrency}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Slippage Tolerance:</span>
                <span>0.5%</span>
              </div>
              <div className="flex justify-between text-white font-medium">
                <span>You'll receive:</span>
                <span>{(convertedAmount - estimatedNetworkFee).toFixed(8)} {toCurrency}</span>
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
            {isLoading ? "Refreshing..." : "Refresh Rate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
