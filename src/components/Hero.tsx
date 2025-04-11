import { useCountdown } from '../hooks/useCountdown';
import { FlipClock } from './FlipClock';

const CountdownDisplay = () => {
  const timeLeft = useCountdown(30);

  return (
    <FlipClock
      days={timeLeft.days}
      hours={timeLeft.hours}
      minutes={timeLeft.minutes}
      seconds={timeLeft.seconds}
    />
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 pt-16 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-6 md:space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
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

          <div className="bg-background/40 p-8 rounded-2xl mb-8 border border-accent/20 backdrop-blur-sm relative overflow-visible shadow-[inset_0_-3em_3em_rgba(0,0,0,0.1),0_0_0_2px_rgba(242,255,68,0.2),0.3em_0.3em_1em_rgba(0,0,0,0.3)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <CountdownDisplay />
              </div>
              <h3 className="text-2xl font-bold text-white">New User Welcome Bonus</h3>
              <p className="text-white/70 text-lg">Deposit $15 or more and receive a <span className="text-accent font-semibold">$5 welcome bonus</span> instantly!</p>
            </div>
            <div className="absolute -right-2 -top-2 bg-gradient-to-b from-[#F2FF44] to-[#d4e038] text-black font-bold py-2 px-8 rounded-tr-lg rounded-bl-lg shadow-lg transform rotate-6 border-2 border-black/10">
              Limited Time
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