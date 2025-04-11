
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { binanceService } from '@/lib/binance-service';
import { UserService } from '@/lib/user-service';
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export const CryptoConverter = () => {
  const cryptocurrencies = [
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' }
  ];
  
  const [fromCurrency, setFromCurrency] = useState({ symbol: 'USDT', balance: 0 });
  const [toCurrency, setToCurrency] = useState({ symbol: 'BTC', balance: 0 });
  const [amount, setAmount] = useState('');
  const [currentRate, setCurrentRate] = useState(0);
  const [outputAmount, setOutputAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [rateExpiryTime, setRateExpiryTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [processingConversion, setProcessingConversion] = useState(false);
  const [conversionFee, setConversionFee] = useState(0);
  const [userAssets, setUserAssets] = useState<Record<string, { amount: number, symbol: string }>>({});

  // Fee percentage (0.5%)
  const FEE_PERCENTAGE = 0.5;
  
  // Fetch user balances and initial rate
  useEffect(() => {
    const fetchUserData = async () => {
      const uid = localStorage.getItem('userId');
      if (uid) {
        try {
          const userData = await UserService.getUserData(uid);
          if (userData) {
            setFromCurrency(prev => ({ 
              ...prev, 
              balance: fromCurrency.symbol === 'USDT' ? userData.balance : (userData.assets?.[fromCurrency.symbol]?.amount || 0) 
            }));
            setToCurrency(prev => ({ 
              ...prev, 
              balance: toCurrency.symbol === 'USDT' ? userData.balance : (userData.assets?.[toCurrency.symbol]?.amount || 0) 
            }));
            setUserAssets(userData.assets || {});
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
    fetchConversionRate();
  }, [fromCurrency.symbol, toCurrency.symbol]);

  // Countdown timer for rate expiry
  useEffect(() => {
    if (!rateExpiryTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const secondsRemaining = Math.max(0, Math.floor((rateExpiryTime.getTime() - now.getTime()) / 1000));
      
      setCountdown(secondsRemaining);
      
      if (secondsRemaining === 0) {
        clearInterval(interval);
        fetchConversionRate(); // Refresh rate when expired
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [rateExpiryTime]);

  // Update output amount when input changes
  useEffect(() => {
    if (amount && currentRate > 0) {
      const inputAmount = parseFloat(amount);
      const fee = (inputAmount * FEE_PERCENTAGE) / 100;
      setConversionFee(fee);
      
      // Calculate output amount after fee
      if (fromCurrency.symbol === 'USDT') {
        const outputBeforeFee = inputAmount / currentRate;
        const outputAfterFee = outputBeforeFee * (1 - FEE_PERCENTAGE / 100);
        setOutputAmount(outputAfterFee.toFixed(8));
      } else if (toCurrency.symbol === 'USDT') {
        const outputBeforeFee = inputAmount * currentRate;
        const outputAfterFee = outputBeforeFee * (1 - FEE_PERCENTAGE / 100);
        setOutputAmount(outputAfterFee.toFixed(2));
      } else {
        // Cross-currency conversion (e.g., BTC to ETH)
        // Convert to USDT first, then to target currency
        const usdtValue = fromCurrency.symbol === 'BTC' ? inputAmount * currentRate : inputAmount / currentRate;
        const outputBeforeFee = toCurrency.symbol === 'BTC' ? usdtValue / currentRate : usdtValue * currentRate;
        const outputAfterFee = outputBeforeFee * (1 - FEE_PERCENTAGE / 100);
        setOutputAmount(outputAfterFee.toFixed(8));
      }
    } else {
      setOutputAmount('0');
      setConversionFee(0);
    }
  }, [amount, currentRate, fromCurrency.symbol, toCurrency.symbol]);

  const fetchConversionRate = async () => {
    try {
      setLoading(true);
      
      let rate;
      // Direct conversion with USDT
      if (fromCurrency.symbol === 'USDT' || toCurrency.symbol === 'USDT') {
        const symbol = fromCurrency.symbol === 'USDT' 
          ? `${toCurrency.symbol}USDT` 
          : `${fromCurrency.symbol}USDT`;
        
        const data = await binanceService.getPrice(symbol);
        rate = parseFloat(data.price);
        
        if (fromCurrency.symbol === 'USDT') {
          // Keep rate as is for USDT to Crypto
        } else {
          // Invert rate for Crypto to USDT
          // rate = 1 / rate;
        }
      } 
      // Cross-currency conversion (e.g., BTC to ETH)
      else {
        // Get rates for both currencies against USDT
        const fromData = await binanceService.getPrice(`${fromCurrency.symbol}USDT`);
        const toData = await binanceService.getPrice(`${toCurrency.symbol}USDT`);
        
        const fromRate = parseFloat(fromData.price);
        const toRate = parseFloat(toData.price);
        
        // Calculate cross rate
        rate = fromRate / toRate;
      }
      
      setCurrentRate(rate);
      
      // Set rate expiry time (60 seconds)
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + 60);
      setRateExpiryTime(expiryTime);
      setCountdown(60);
      
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      toast({
        title: "Error",
        description: "Failed to fetch current conversion rate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = { ...fromCurrency };
    setFromCurrency({ ...toCurrency });
    setToCurrency(temp);
    setAmount('');
    fetchConversionRate();
  };

  const isValidAmount = () => {
    const numAmount = parseFloat(amount);
    return (
      !isNaN(numAmount) && 
      numAmount >= 0.01 && 
      numAmount <= 4700000 && 
      numAmount <= fromCurrency.balance
    );
  };

  const handlePreviews = () => {
    if (!isValidAmount()) return;
    setConfirmDialogOpen(true);
  };

  const handleConfirmConversion = async () => {
    setProcessingConversion(true);
    
    try {
      const uid = localStorage.getItem('userId');
      if (!uid) {
        throw new Error('User not logged in');
      }

      // Re-fetch user data to ensure balance is current
      const userData = await UserService.getUserData(uid);
      if (!userData) {
        throw new Error('User data not found');
      }

      const numAmount = parseFloat(amount);
      const outputAmountValue = parseFloat(outputAmount);
      
      // Verify balance again
      const currentFromBalance = fromCurrency.symbol === 'USDT' 
        ? userData.balance 
        : (userData.assets?.[fromCurrency.symbol]?.amount || 0);
      
      if (currentFromBalance < numAmount) {
        throw new Error(`Insufficient ${fromCurrency.symbol} balance`);
      }

      // Create transaction record
      const transaction = {
        type: 'Conversion',
        fromAsset: fromCurrency.symbol,
        toAsset: toCurrency.symbol,
        fromAmount: numAmount,
        toAmount: outputAmountValue,
        timestamp: new Date().toISOString(),
        status: 'Completed',
        rate: currentRate,
        fee: conversionFee
      };

      // Initialize assets if not exists
      const updatedAssets = { ...(userData.assets || {}) };

      // Handle the conversion - deduct source currency
      if (fromCurrency.symbol === 'USDT') {
        userData.balance = Number((userData.balance - numAmount).toFixed(8));
      } else {
        const fromAssetBalance = updatedAssets[fromCurrency.symbol]?.amount || 0;
        updatedAssets[fromCurrency.symbol] = {
          amount: Number((fromAssetBalance - numAmount).toFixed(8)),
          symbol: fromCurrency.symbol
        };
      }

      // Credit target currency
      if (toCurrency.symbol === 'USDT') {
        userData.balance = Number((userData.balance + outputAmountValue).toFixed(8));
      } else {
        const toAssetBalance = updatedAssets[toCurrency.symbol]?.amount || 0;
        updatedAssets[toCurrency.symbol] = {
          amount: Number((toAssetBalance + outputAmountValue).toFixed(8)),
          symbol: toCurrency.symbol
        };
      }

      // Prepare final update with all changes
      const finalData = {
        ...userData,
        balance: userData.balance,
        assets: updatedAssets,
        transactions: [...(userData.transactions || []), transaction]
      };

      // Update everything in one call
      await UserService.updateUserData(uid, finalData);
      
      // Reset form and show success
      setAmount('');
      setConfirmDialogOpen(false);
      
      toast({
        title: "Conversion Successful",
        description: `Converted ${numAmount} ${fromCurrency.symbol} to ${outputAmountValue.toFixed(8)} ${toCurrency.symbol}`,
      });
      
      // Refresh balances
      const updatedUserData = await UserService.getUserData(uid);
      if (updatedUserData) {
        setFromCurrency(prev => ({ 
          ...prev, 
          balance: fromCurrency.symbol === 'USDT' ? updatedUserData.balance : (updatedUserData.assets?.[fromCurrency.symbol]?.amount || 0) 
        }));
        setToCurrency(prev => ({ 
          ...prev, 
          balance: toCurrency.symbol === 'USDT' ? updatedUserData.balance : (updatedUserData.assets?.[toCurrency.symbol]?.amount || 0) 
        }));
      }
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "There was an error processing your conversion",
        variant: "destructive",
      });
    } finally {
      setProcessingConversion(false);
    }
  };

  const getRateDisplay = () => {
    if (fromCurrency.symbol === 'USDT') {
      return `1 ${fromCurrency.symbol} = ${(1 / currentRate).toFixed(8)} ${toCurrency.symbol}`;
    } else if (toCurrency.symbol === 'USDT') {
      return `1 ${fromCurrency.symbol} = ${currentRate.toFixed(2)} ${toCurrency.symbol}`;
    } else {
      return `1 ${fromCurrency.symbol} = ${currentRate.toFixed(8)} ${toCurrency.symbol}`;
    }
  };

  return (
    <>
      <Card className="bg-background/40 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white">Convert {fromCurrency.symbol} to {toCurrency.symbol}</CardTitle>
          <p className="text-sm text-white/70">
            Instant Conversion | Real-Time Rates | {countdown > 0 ? `Rate locked for ${countdown}s` : 'Updating rate...'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">From</span>
                  <span className="text-sm text-white/70">
                    Available Balance: {fromCurrency.balance.toFixed(8)} {fromCurrency.symbol}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.01 - 4,700,000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-background/40 border-white/10 text-white"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${fromCurrency.symbol.toLowerCase()}.svg`}
                        alt={fromCurrency.symbol}
                        className="w-5 h-5"
                        onError={(e) => {
                          e.currentTarget.src = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg';
                        }}
                      />
                      <select 
                        value={fromCurrency.symbol}
                        onChange={(e) => {
                          const newSymbol = e.target.value;
                          const newBalance = newSymbol === 'USDT' 
                            ? parseFloat(localStorage.getItem('userBalance') || '0') 
                            : (userAssets[newSymbol]?.amount || 0);
                          
                          setFromCurrency({ symbol: newSymbol, balance: newBalance });
                          setAmount('');
                        }}
                        className="bg-transparent text-white font-medium cursor-pointer outline-none [&>option]:bg-[#0F1115]"
                      >
                        {cryptocurrencies.map(crypto => (
                          <option key={crypto.symbol} value={crypto.symbol}>
                            {crypto.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  variant="ghost" 
                  className="text-white"
                  onClick={handleSwap}
                >
                  <ArrowUpDown className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">To</span>
                  <span className="text-sm text-white/70">
                    Available Balance: {toCurrency.balance.toFixed(8)} {toCurrency.symbol}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={outputAmount}
                    readOnly
                    className="bg-background/40 border-white/10 text-white"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${toCurrency.symbol.toLowerCase()}.svg`}
                        alt={toCurrency.symbol}
                        className="w-5 h-5"
                        onError={(e) => {
                          e.currentTarget.src = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg';
                        }}
                      />
                      <select 
                        value={toCurrency.symbol}
                        onChange={(e) => {
                          const newSymbol = e.target.value;
                          const newBalance = newSymbol === 'USDT' 
                            ? parseFloat(localStorage.getItem('userBalance') || '0') 
                            : (userAssets[newSymbol]?.amount || 0);
                          
                          setToCurrency({ symbol: newSymbol, balance: newBalance });
                          setAmount('');
                        }}
                        className="bg-transparent text-white font-medium cursor-pointer outline-none [&>option]:bg-[#0F1115]"
                      >
                        {cryptocurrencies.filter(crypto => crypto.symbol !== fromCurrency.symbol).map(crypto => (
                          <option key={crypto.symbol} value={crypto.symbol}>
                            {crypto.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="py-3 px-4 bg-background/30 rounded-md">
                  <div className="text-sm text-white/80 space-y-1">
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span>{getRateDisplay()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fee ({FEE_PERCENTAGE}%):</span>
                      <span>{conversionFee.toFixed(6)} {fromCurrency.symbol}</span>
                    </div>
                    <div className="flex justify-between font-medium text-white">
                      <span>You'll receive:</span>
                      <span>≈ {outputAmount} {toCurrency.symbol}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                className="w-full bg-[#e3ef3b] hover:bg-[#e3ef3b]/90 text-black"
                disabled={!isValidAmount() || loading}
                onClick={handlePreviews}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Fetching Rate...
                  </>
                ) : !amount ? 'Enter an amount' : 
                   !isValidAmount() ? 'Insufficient balance' : 
                   'Preview Conversion'}
              </Button>
              
              {/* Refresh rate button */}
              <Button 
                variant="outline" 
                className="w-full border-white/10 text-white/80"
                onClick={fetchConversionRate}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Refresh Rate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-lg border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Conversion</DialogTitle>
            <DialogDescription className="text-white/70">
              Please review the details of your conversion
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">From:</span>
                <span className="font-medium">{amount} {fromCurrency.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">To:</span>
                <span className="font-medium">{outputAmount} {toCurrency.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Rate:</span>
                <span>{getRateDisplay()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Fee ({FEE_PERCENTAGE}%):</span>
                <span>{conversionFee.toFixed(6)} {fromCurrency.symbol}</span>
              </div>
            </div>
            
            <div className="bg-background/40 p-3 rounded-md text-sm text-white/80">
              <p>Rate locked for {countdown} seconds. This conversion cannot be reversed after confirmation.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={processingConversion}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmConversion}
              className="bg-[#e3ef3b] hover:bg-[#e3ef3b]/90 text-black"
              disabled={processingConversion}
            >
              {processingConversion ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Processing...
                </>
              ) : 'Confirm Conversion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
