
import { Shield, Sparkles, Award } from "lucide-react";

// Bot tiers data
export const botTiers = [
  {
    id: "standard",
    type: "Standard Bot",
    description: "A reliable bot for basic automated trading",
    icon: Shield,
    iconColor: "text-blue-400",
    price: 10,
    profit: "+1.2% / trade",
    pair: "BTC/USDT",
    marketType: "Spot",
    duration: "5 min"
  },
  {
    id: "master",
    type: "Master Bot",
    description: "Advanced trading with higher accuracy",
    icon: Sparkles,
    iconColor: "text-purple-400",
    price: 20,
    profit: "+1.8% / trade",
    pair: "ETH/USDT",
    marketType: "Futures",
    duration: "15 min"
  },
  {
    id: "pro-basic",
    type: "Pro Basic",
    description: "Professional grade automated trading",
    icon: Award,
    iconColor: "text-yellow-400",
    price: 50,
    profit: "+2.5% / trade",
    pair: "BNB/USDT",
    marketType: "Spot & Futures",
    duration: "30 min"
  }
];
