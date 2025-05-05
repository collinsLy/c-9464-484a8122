
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

interface CryptoConverterProps {
  onAmountChange?: (amount: number, fromCurrency: string, toCurrency: string) => void;
}

export const CryptoConverter: React.FC<CryptoConverterProps> = ({ onAmountChange }) => {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USDT');
  const [toCurrency, setToCurrency] = useState<string>('BTC');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

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
  };

  return (
    <Card className="bg-black/90 text-white border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle>Convert {fromCurrency} to {toCurrency}</CardTitle>
        <p className="text-xs text-gray-400 mt-1">Instant Conversion | Real-Time Rates | Rate locked for 51s</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">From</label>
              <span className="text-xs text-gray-400">Available Balance: {userBalances[fromCurrency]?.toFixed(8) || "0.00000000"} {fromCurrency}</span>
            </div>
            <div className="flex space-x-2">
              <Input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.01 - 4,700,000"
                className="bg-black/50 border-gray-700 text-white rounded-full flex-grow"
              />
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="bg-black/50 border-gray-700 text-white rounded-full w-32">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-xs">
                      {fromCurrency === 'USDT' && 'T'}
                      {fromCurrency === 'BTC' && 'B'}
                      {fromCurrency === 'ETH' && 'E'}
                    </div>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-gray-700">
                  <SelectItem value="USDT" className="text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-xs">T</div>
                      USDT
                    </div>
                  </SelectItem>
                  <SelectItem value="BTC" className="text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs">B</div>
                      BTC
                    </div>
                  </SelectItem>
                  <SelectItem value="ETH" className="text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">E</div>
                      ETH
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              className="rounded-full h-10 w-10 p-0 bg-gray-800 hover:bg-gray-700"
              onClick={handleSwapCurrencies}
            >
              <ArrowUpDown className="h-5 w-5 text-white" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400">To</label>
              <span className="text-xs text-gray-400">Available Balance: {userBalances[toCurrency]?.toFixed(8) || "0.00000000"} {toCurrency}</span>
            </div>
            <div className="flex space-x-2">
              <Input
                type="text"
                value={convertedAmount !== null ? convertedAmount.toFixed(8) : ''}
                readOnly
                placeholder="0"
                className="bg-black/50 border-gray-700 text-white rounded-full flex-grow"
              />
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="bg-black/50 border-gray-700 text-white rounded-full w-32">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs">
                      {toCurrency === 'USDT' && 'T'}
                      {toCurrency === 'BTC' && 'B'}
                      {toCurrency === 'ETH' && 'E'}
                    </div>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-gray-700">
                  <SelectItem value="USDT" className="text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-xs">T</div>
                      USDT
                    </div>
                  </SelectItem>
                  <SelectItem value="BTC" className="text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs">B</div>
                      BTC
                    </div>
                  </SelectItem>
                  <SelectItem value="ETH" className="text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">E</div>
                      ETH
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleConvert} 
            className="w-full bg-olive-600 hover:bg-olive-700 text-black font-medium rounded-full py-6"
            disabled={!amount || isNaN(Number(amount))}
          >
            {!amount ? "Enter an amount" : "Convert"}
          </Button>

          <Button 
            onClick={refreshRate} 
            variant="outline" 
            className="w-full border-gray-700 text-white hover:bg-gray-800 rounded-full"
          >
            Refresh Rate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
