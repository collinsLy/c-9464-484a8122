
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowUpDown } from 'lucide-react';
import { binanceService } from '@/lib/binance-service';
import { UserService } from '@/lib/user-service';

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
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalances = async () => {
      const uid = localStorage.getItem('userId');
      if (uid) {
        const userData = await UserService.getUserData(uid);
        setFromCurrency(prev => ({ ...prev, balance: userData?.balance || 0 }));
      }
    };

    const fetchPrice = async () => {
      try {
        const price = await binanceService.getPrice('BTCUSDT');
        setCurrentPrice(parseFloat(price.price));
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    fetchBalances();
    fetchPrice();

    const priceInterval = setInterval(fetchPrice, 5000);
    return () => clearInterval(priceInterval);
  }, []);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setAmount('');
  };

  const isValidAmount = () => {
    const numAmount = parseFloat(amount);
    return numAmount >= 0.01 && numAmount <= 4700000 && numAmount <= fromCurrency.balance;
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-white">Convert {fromCurrency.symbol} to {toCurrency.symbol}</CardTitle>
        <p className="text-sm text-white/70">Instant Price | Guaranteed Price | Any Pair</p>
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
                        onChange={(e) => setFromCurrency(prev => ({ ...prev, symbol: e.target.value }))}
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
                    placeholder="0.00000013 - 58"
                    value={amount ? (parseFloat(amount) / currentPrice).toFixed(8) : ''}
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
                        onChange={(e) => setToCurrency(prev => ({ ...prev, symbol: e.target.value }))}
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

              <Button 
                className="w-full bg-[#e3ef3b] hover:bg-[#e3ef3b]/90 text-black"
                disabled={!isValidAmount()}
                onClick={async () => {
                  if (!isValidAmount()) return;
                  
                  const uid = localStorage.getItem('userId');
                  if (!uid) return;

                  try {
                    setLoading(true);
                    const numAmount = parseFloat(amount);
                    const convertedAmount = numAmount / currentPrice;
                    
                    // Update user's balances
                    const userData = await UserService.getUserData(uid);
                    const updatedData = {
                      balance: userData.balance - numAmount,
                      assets: {
                        ...(userData.assets || {}),
                        [toCurrency.symbol]: {
                          amount: ((userData.assets?.[toCurrency.symbol]?.amount || 0) + convertedAmount),
                          symbol: toCurrency.symbol
                        }
                      }
                    };
                    
                    await UserService.updateUserData(uid, updatedData);
                    setAmount('');
                    toast({
                      title: "Conversion Successful",
                      description: `Converted ${numAmount} ${fromCurrency.symbol} to ${convertedAmount.toFixed(8)} ${toCurrency.symbol}`,
                    });
                  } catch (error) {
                    console.error('Conversion error:', error);
                    toast({
                      title: "Conversion Failed",
                      description: "There was an error processing your conversion",
                      variant: "destructive",
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? 'Converting...' : !amount ? 'Enter an amount' : isValidAmount() ? 'Convert' : 'Insufficient balance'}
              </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
