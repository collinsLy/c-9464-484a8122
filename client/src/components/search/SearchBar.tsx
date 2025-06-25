
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

// Define type for page data
interface PageData {
  title: string;
  path: string;
  keywords: string[];
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Import all icons we'll use
import {
  Home, LineChart, BarChart3, Wallet, CreditCard,
  TrendingUp, History, Settings, PlayCircle, Menu,
  Users, Bell, Sparkles, ArrowUpCircle, ArrowDownCircle,
  HelpCircle, ArrowLeftRight, GitBranch, BrainCircuit,
  Trophy, Percent, Repeat, Droplets, BadgePercent, KeyRound
} from "lucide-react";

// Create a comprehensive list of all pages in the application
const pagesData: PageData[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    keywords: ["home", "overview", "main", "summary"],
    description: "Main dashboard overview",
    icon: Home
  },
  {
    title: "Assets",
    path: "/assets",
    keywords: ["portfolio", "coins", "tokens", "balance", "holdings"],
    description: "View and manage your crypto assets",
    icon: Wallet
  },
  {
    title: "Deposit",
    path: "/deposit",
    keywords: ["fund", "add", "money", "transfer in", "buy"],
    description: "Deposit funds to your account",
    icon: ArrowUpCircle
  },
  {
    title: "Withdraw",
    path: "/withdraw",
    keywords: ["transfer out", "cash out", "sell", "send"],
    description: "Withdraw funds from your account",
    icon: ArrowDownCircle
  },
  {
    title: "Transaction History",
    path: "/history",
    keywords: ["transactions", "records", "transfers", "log"],
    description: "View your transaction history",
    icon: History
  },
  {
    title: "Settings",
    path: "/settings",
    keywords: ["preferences", "account", "profile", "security"],
    description: "Manage your account settings",
    icon: Settings
  },
  {
    title: "Spot Markets",
    path: "/spot-markets",
    keywords: ["market", "exchange", "prices", "crypto", "coins"],
    description: "View spot market data",
    icon: LineChart
  },
  {
    title: "Futures Markets",
    path: "/futures-markets",
    keywords: ["derivatives", "futures", "contracts", "leverage"],
    description: "View futures market data",
    icon: TrendingUp
  },
  {
    title: "New Listings",
    path: "/new-listings",
    keywords: ["new coins", "tokens", "listings", "launches"],
    description: "View newly listed cryptocurrencies",
    icon: Sparkles
  },
  {
    title: "Top Movers",
    path: "/top-movers",
    keywords: ["gainers", "losers", "trending", "volatile"],
    description: "View top price movers",
    icon: BarChart3
  },
  {
    title: "Spot Trading",
    path: "/spot-trading",
    keywords: ["exchange", "buy", "sell", "trade", "crypto"],
    description: "Trade cryptocurrencies on spot market",
    icon: LineChart
  },
  {
    title: "Margin Trading",
    path: "/margin-trading",
    keywords: ["leverage", "borrow", "loan", "margin"],
    description: "Trade with leverage on margin",
    icon: TrendingUp
  },
  {
    title: "Strategy Trading",
    path: "/strategy-trading",
    keywords: ["algorithm", "bot", "automated", "strategy"],
    description: "Create and deploy trading strategies",
    icon: BrainCircuit
  },
  {
    title: "Trading Bots",
    path: "/bots",
    keywords: ["automated", "bot", "algorithm", "strategy"],
    description: "Setup and manage trading bots",
    icon: PlayCircle
  },
  {
    title: "USDT-M Futures",
    path: "/usdt-futures",
    keywords: ["usdt", "tether", "futures", "perpetual", "contracts"],
    description: "Trade USDT margined futures contracts",
    icon: ArrowLeftRight
  },
  {
    title: "COIN-M Futures",
    path: "/coin-futures",
    keywords: ["coin", "crypto", "futures", "perpetual", "contracts"],
    description: "Trade coin margined futures contracts",
    icon: Wallet
  },
  {
    title: "Options",
    path: "/options",
    keywords: ["derivatives", "puts", "calls", "contracts"],
    description: "Trade crypto options",
    icon: GitBranch
  },
  {
    title: "Leaderboard",
    path: "/leaderboard",
    keywords: ["ranking", "traders", "performance", "top"],
    description: "View top traders leaderboard",
    icon: Trophy
  },
  {
    title: "Simple Earn",
    path: "/simple-earn",
    keywords: ["interest", "yield", "earn", "staking", "rewards"],
    description: "Earn interest on your crypto",
    icon: Percent
  },
  {
    title: "Auto-Invest",
    path: "/auto-invest",
    keywords: ["dca", "dollar cost averaging", "recurring", "invest"],
    description: "Setup automatic recurring investments",
    icon: Repeat
  },
  {
    title: "Staking",
    path: "/staking",
    keywords: ["stake", "validator", "rewards", "earn", "passive"],
    description: "Stake your crypto to earn rewards",
    icon: BadgePercent
  },
  {
    title: "Liquidity Farming",
    path: "/liquidity-farming",
    keywords: ["liquidity", "yield", "farming", "pool", "lp"],
    description: "Provide liquidity and earn rewards",
    icon: Droplets
  },
  {
    title: "Vertex Card",
    path: "/vertex-card",
    keywords: ["debit", "credit", "card", "payment", "spend"],
    description: "Apply for and manage your Vertex Card",
    icon: CreditCard
  },
  {
    title: "Alerts",
    path: "/alerts",
    keywords: ["notification", "price", "alert", "monitor"],
    description: "Setup price and market alerts",
    icon: Bell
  },
  {
    title: "API Management",
    path: "/api-management",
    keywords: ["api", "key", "secret", "integration", "developer"],
    description: "Manage your API keys",
    icon: KeyRound
  },
  {
    title: "Support",
    path: "/support",
    keywords: ["help", "assistance", "contact", "ticket", "issue"],
    description: "Get help and support",
    icon: HelpCircle
  },
  {
    title: "Demo",
    path: "/demo",
    keywords: ["practice", "test", "simulation", "trial"],
    description: "Try the platform in demo mode",
    icon: PlayCircle
  },
  {
    title: "Crypto Converter",
    path: "/crypto-converter",
    keywords: ["convert", "swap", "exchange", "change", "currency"],
    description: "Convert between different cryptocurrencies",
    icon: ArrowLeftRight
  },
];

interface SearchBarProps {
  className?: string;
}

const SearchBar = ({ className }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<PageData[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Filter pages based on search query
    const results = pagesData.filter(page => {
      const titleMatch = page.title.toLowerCase().includes(query.toLowerCase());
      const keywordMatch = page.keywords.some(keyword => 
        keyword.toLowerCase().includes(query.toLowerCase())
      );
      const descriptionMatch = page.description.toLowerCase().includes(query.toLowerCase());
      
      return titleMatch || keywordMatch || descriptionMatch;
    });

    setSearchResults(results);
  };

  // Handle clicking outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigate to selected page and reset search
  const handleSelectResult = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setIsSearchFocused(false);
    setSearchResults([]);
  };

  // Handle keyboard navigation
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelectResult(searchResults[activeIndex].path);
    } else if (e.key === "Escape") {
      setIsSearchFocused(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search features, pages, etc..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9 bg-background/20 border-white/10 text-white w-full"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-white"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isSearchFocused && searchResults.length > 0 && (
        <Card className="absolute z-50 top-full mt-1 w-full bg-background/95 backdrop-blur-lg border-white/10 shadow-lg">
          <ScrollArea className="max-h-[60vh]">
            <div className="p-2">
              {searchResults.map((result, index) => (
                <div
                  key={result.path}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                    index === activeIndex 
                      ? "bg-white/10" 
                      : "hover:bg-white/5"
                  }`}
                  onClick={() => handleSelectResult(result.path)}
                >
                  <result.icon className="h-5 w-5 text-white/70" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{result.title}</div>
                    <div className="text-xs text-white/50">{result.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
