
import { LucideIcon } from "lucide-react";

export interface BotTier {
  id: string;
  type: string;
  price: number;
  description: string;
  duration: string;
  pair: string;
  marketType: string;
  profit: string;
  icon: LucideIcon;
  iconColor: string;
}
