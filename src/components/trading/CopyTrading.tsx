
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  rank: string;
  roi: string;
  aum: string;
  mdd: string;
  sharpeRatio: string;
  pnl: string;
}

export const CopyTrading = () => {
  const [filter, setFilter] = useState('');
  
  const traders: Trader[] = [
    {
      id: '1',
      name: 'KNOTMAIN',
      rank: '850/1000',
      roi: '+14.28%',
      aum: '5,505,754.27',
      mdd: '8.64%',
      sharpeRatio: '2.31',
      pnl: '+91,203.10'
    },
    {
      id: '2',
      name: 'Kevin Che',
      rank: '785/1100',
      roi: '+14.20%',
      aum: '1,730,637.44',
      mdd: '19.96%',
      sharpeRatio: '2.64',
      pnl: '+23,426.94'
    },
    {
      id: '3',
      name: 'CryptoWhale',
      rank: '920/1000',
      roi: '+22.15%',
      aum: '8,234,567.89',
      mdd: '12.45%',
      sharpeRatio: '3.12',
      pnl: '+156,789.32'
    },
    {
      id: '4',
      name: 'TradeMaster',
      rank: '795/1000',
      roi: '+18.73%',
      aum: '3,456,789.12',
      mdd: '15.32%',
      sharpeRatio: '2.87',
      pnl: '+67,891.23'
    },
    {
      id: '5',
      name: 'AlphaTrader',
      rank: '880/1000',
      roi: '+16.92%',
      aum: '4,567,890.23',
      mdd: '10.78%',
      sharpeRatio: '2.95',
      pnl: '+78,912.34'
    },
    {
      id: '6',
      name: 'BitStrategy',
      rank: '830/1000',
      roi: '+19.45%',
      aum: '2,345,678.90',
      mdd: '14.23%',
      sharpeRatio: '2.76',
      pnl: '+45,678.90'
    },
    {
      id: '7',
      name: 'CryptoNinja',
      rank: '905/1000',
      roi: '+20.87%',
      aum: '6,789,012.34',
      mdd: '11.56%',
      sharpeRatio: '3.05',
      pnl: '+123,456.78'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Copy Trading</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search traders..."
            className="pl-9"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {traders.map((trader) => (
          <Card key={trader.id} className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{trader.name}</h3>
                  <p className="text-sm text-white/70">Rank: {trader.rank}</p>
                </div>
                <Button variant="outline" className="bg-yellow-400 text-black hover:bg-yellow-500">
                  Copy
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/70">ROI</p>
                  <p className="text-white font-medium">{trader.roi}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">AUM</p>
                  <p className="text-white font-medium">${trader.aum}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">30D MDD</p>
                  <p className="text-white font-medium">{trader.mdd}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Sharpe Ratio</p>
                  <p className="text-white font-medium">{trader.sharpeRatio}</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-sm text-white/70">30 Days PNL</p>
                <p className="text-xl font-bold text-green-400">{trader.pnl}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
