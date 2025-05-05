
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CryptoConverterProps {
  onAmountChange?: (amount: number, fromCurrency: string, toCurrency: string) => void;
}

export const CryptoConverter: React.FC<CryptoConverterProps> = ({ onAmountChange }) => {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('BTC');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  const currencies = [
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'USDT', label: 'Tether (USDT)' },
    { value: 'USD', label: 'US Dollar (USD)' },
  ];

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

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle>Crypto Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="bg-background/40 border-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">From</label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="bg-background/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">To</label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="bg-background/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleConvert} className="w-full">
            Convert
          </Button>

          {convertedAmount !== null && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-center">
                {amount} {fromCurrency} = {convertedAmount.toFixed(8)} {toCurrency}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
