
import { Shield, Sparkles, Award } from "lucide-react";

// Bot tiers data
export const botTiers = [
  { 
    id: "standard", 
    type: "Standard", 
    price: 20, 
    description: "Basic trading bot with automated Rise & Fall predictions", 
    duration: "2 seconds", 
    pair: "SOL/USD", 
    marketType: "Rise & Fall", 
    profit: "100%",
    icon: "https://cryptologos.cc/logos/injective-inj-logo.svg?v=040",
    iconColor: "text-blue-400"
  },
  { 
    id: "master", 
    type: "Master", 
    price: 40, 
    description: "Advanced bot with Even/Odd market predictions for Bitcoin", 
    duration: "2 seconds", 
    pair: "BTC/USD", 
    marketType: "Even/Odd", 
    profit: "80%",
    icon: "https://cryptologos.cc/logos/oasis-network-rose-logo.svg?v=040",
    iconColor: "text-purple-400"
  },
  { 
    id: "pro-basic", 
    type: "Pro (Basic)", 
    price: 100, 
    description: "Professional bot with advanced algorithms for BNB", 
    duration: "N/A", 
    pair: "BNB/USD", 
    marketType: "Even/Odd", 
    profit: "100%",
    icon: "https://cryptologos.cc/logos/unus-sed-leo-leo-logo.svg?v=040",
    iconColor: "text-yellow-400"
  },
  { 
    id: "pro-premium", 
    type: "Pro (Premium)", 
    price: 200, 
    description: "Premium bot with highest success rate and profit potential", 
    duration: "1 second", 
    pair: "ETH/USD", 
    marketType: "Even/Odd", 
    profit: "200%",
    icon: "https://cryptologos.cc/logos/polymath-network-poly-logo.svg?v=040",
    iconColor: "text-pink-400"
  },
];
