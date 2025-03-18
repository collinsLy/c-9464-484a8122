
import { useCountdown } from '../hooks/useCountdown';

const CountdownDisplay = () => {
  const timeLeft = useCountdown(30);
  
  return (
    <span className="text-white/60 text-sm">
      Ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  );
};


import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import OpenAccountForm from "./OpenAccountForm";

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
          
          <div className="bg-accent/10 p-6 rounded-xl mb-8 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-accent/20 text-accent px-2 py-1 rounded text-sm font-medium">Limited Time Offer</span>
              <CountdownDisplay />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">New User Welcome Bonus</h3>
            <p className="text-white/70">Deposit $15 or more and receive a $5 welcome bonus instantly!</p>
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
