import { Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "./ui/button";

const Footer = () => {
  return (
    <footer className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5 backdrop-blur-3xl"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="Vertex Trading" className="h-8 w-8" />
              <h3 className="text-2xl font-bold text-white">Vertex Trading</h3>
            </div>
            <p className="text-white/60">
              Advanced cryptocurrency trading platform with real-time data and powerful tools.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Github className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Trading</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Spot Trading</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Margin Trading</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Derivatives</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Trading Bots</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Markets</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Market Overview</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Top Gainers</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">New Listings</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Market Analysis</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Trading Guide</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Fee Structure</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Support Center</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-white/60">
            © 2024 Vertex Trading. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;