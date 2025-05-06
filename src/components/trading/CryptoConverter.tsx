
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

interface CryptoConverterProps {
  onAmountChange?: (amount: number, fromCurrency: string, toCurrency: string) => void;
}

export const CryptoConverter: React.FC<CryptoConverterProps> = ({ onAmountChange }) => {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USDT');
  const [toCurrency, setToCurrency] = useState<string>('BTC');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(18);

  // Mock user balances - in a real app, these would come from your user state
  const userBalances = {
    USDT: 72.00000000,
    BTC: 0.00263289,
    ETH: 0.15000000,
  };

  // Mock conversion rates - in a real app, these would come from an API
  const rates = {
    BTC: { USD: 65000, ETH: 20, USDT: 65000 },
    ETH: { USD: 3200, BTC: 0.05, USDT: 3200 },
    USDT: { USD: 1, BTC: 0.000015, ETH: 0.0003 },
    USD: { BTC: 0.000015, ETH: 0.0003, USDT: 1 },
  };

  useEffect(() => {
    if (amount && !isNaN(Number(amount))) {
      handleConvert();
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
    let result;

    if (fromCurrency === toCurrency) {
      result = numAmount;
    } else {
      result = numAmount * rates[fromCurrency][toCurrency];
    }

    setConvertedAmount(result);
    if (onAmountChange) {
      onAmountChange(numAmount, fromCurrency, toCurrency);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount('');
    setConvertedAmount(null);
  };

  const refreshRate = () => {
    // In a real app, this would fetch fresh rates
    handleConvert();
    setTimeLeft(18);
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'BTC':
        return (
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs">
            B
          </div>
        );
      case 'USDT':
        return (
          <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-xs">
            T
          </div>
        );
      case 'ETH':
        return (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">
            E
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs">
            ?
          </div>
        );
    }
  };

  return (
    <Card className="bg-black text-white border border-gray-800 rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Convert {fromCurrency} to {toCurrency}</CardTitle>
        <p className="text-xs text-gray-400 mt-1">Instant Conversion | Real-Time Rates | Rate locked for {timeLeft}s</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">From</label>
              <span className="text-xs text-gray-400">Available Balance: {userBalances[fromCurrency]?.toFixed(8) || "0.00000000"} {fromCurrency}</span>
            </div>
            <div className="flex relative">
              <Input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.01 - 4,700,000"
                className="bg-black border-gray-700 text-white rounded-full h-12 pr-28"
              />
              <div className="absolute right-0 top-0 h-full flex items-center pr-4">
                <div className="flex items-center gap-2 bg-transparent text-white px-3 py-2 rounded-full">
                  {getCurrencyIcon(fromCurrency)}
                  <span className="font-medium">{fromCurrency}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              className="rounded-full h-10 w-10 p-0 bg-transparent hover:bg-gray-800"
              onClick={handleSwapCurrencies}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M7 10L12 5L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 14L12 19L7 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">To</label>
              <span className="text-xs text-gray-400">Available Balance: {userBalances[toCurrency]?.toFixed(8) || "0.00000000"} {toCurrency}</span>
            </div>
            <div className="flex relative">
              <Input
                type="text"
                value={convertedAmount !== null ? convertedAmount.toFixed(8) : '0'}
                readOnly
                placeholder="0"
                className="bg-black border-gray-700 text-white rounded-full h-12 pr-28"
              />
              <div className="absolute right-0 top-0 h-full flex items-center pr-4">
                <div className="flex items-center gap-2 bg-transparent text-white px-3 py-2 rounded-full">
                  {getCurrencyIcon(toCurrency)}
                  <span className="font-medium">{toCurrency}</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleConvert} 
            className="w-full bg-[#9ba419] hover:bg-[#8a9315] text-black font-medium rounded-full py-6 h-12"
            disabled={!amount || isNaN(Number(amount))}
          >
            {!amount ? "Enter an amount" : "Convert"}
          </Button>

          <Button 
            onClick={refreshRate} 
            variant="outline" 
            className="w-full border border-gray-700 text-white hover:bg-gray-800 rounded-full h-12"
          >
            Refresh Rate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
