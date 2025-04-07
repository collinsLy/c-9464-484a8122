import { useCountdown } from '../hooks/useCountdown';

const CountdownDisplay = () => {
  const timeLeft = useCountdown(30);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center bg-white/5 rounded-lg px-3 py-2">
      <span className="text-xl font-bold text-white">{value.toString().padStart(2, '0')}</span>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-2">
      <TimeUnit value={timeLeft.days} label="DAYS" />
      <TimeUnit value={timeLeft.hours} label="HRS" />
      <TimeUnit value={timeLeft.minutes} label="MIN" />
      <TimeUnit value={timeLeft.seconds} label="SEC" />
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import OpenAccountForm from "./OpenAccountForm";

import { CryptoTicker } from './CryptoTicker';


const Hero = () => {
  const [openAccount, setOpenAccount] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Trade Crypto with <span className="text-[#F2FF44]">Confidence</span>
          </h1>
          <p className="text-lg text-white/80 max-w-xl">
            Advanced trading platform with real-time charts, competitive fees, and powerful tools for both beginners and professional traders.
          </p>

          <Dialog open={openAccount} onOpenChange={setOpenAccount}>
            <DialogTrigger asChild>
              <Button className="px-8 py-6 text-lg bg-white text-black hover:bg-white/90 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Start Trading Now
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Open Trading Account</DialogTitle>
                <DialogDescription>
                  Get started with Vertex Trading in minutes
                </DialogDescription>
              </DialogHeader>
              <OpenAccountForm onSuccess={() => setOpenAccount(false)} />
            </DialogContent>
          </Dialog>

          <div className="bg-gradient-to-r from-accent/20 to-accent/5 p-8 rounded-2xl mb-8 border border-accent/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="bg-accent px-3 py-1.5 rounded-full text-sm font-semibold text-white shadow-lg shadow-accent/20">Limited Time Offer</span>
                <CountdownDisplay />
              </div>
              <h3 className="text-2xl font-bold text-white">New User Welcome Bonus</h3>
              <p className="text-white/70 text-lg">Deposit $15 or more and receive a <span className="text-accent font-semibold">$5 welcome bonus</span> instantly!</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8">
            <div>
              <div className="text-3xl font-bold text-white">100+</div>
              <div className="text-white/60">Crypto Assets</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-white/60">Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">0.1%</div>
              <div className="text-white/60">Trading Fee</div>
            </div>
          </div>
          <CryptoTicker /> {/* Added CryptoTicker here */}
        </div>
        <div className="relative">
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="tradingview-widget-container h-[400px]" id="tradingview-widget">
              {/* TradingView widget will be initialized here */}
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;