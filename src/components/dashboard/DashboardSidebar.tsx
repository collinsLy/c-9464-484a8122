import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronLeft,
  Home,
  LineChart,
  BarChart3,
  Wallet,
  CreditCard,
  TrendingUp,
  History,
  Settings,
  PlayCircle,
  Menu,
  X,
  Users,
  Bell,
  Sparkles,
  ArrowUpCircle,
  ArrowDownCircle,
  HelpCircle,
  ArrowLeftRight,
  GitBranch,
  BrainCircuit,
  Trophy,
  Percent,
  Repeat,
  Droplets,
  BadgePercent,
  KeyRound,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  id: string;
  path: string;
}

interface NavCategory {
  label: string;
  items: NavItem[];
}

const defaultNavCategories: NavCategory[] = [
  {
    label: "Overview",
    items: [
      { icon: Home, label: "Dashboard", id: "dashboard", path: "/dashboard" },
      { icon: Wallet, label: "Assets", id: "assets", path: "/assets" },
      { icon: ArrowUpCircle, label: "Deposit", id: "deposit", path: "/deposit" },
      { icon: ArrowDownCircle, label: "Withdraw", id: "withdraw", path: "/withdraw" },
      { icon: History, label: "History", id: "history", path: "/history" },
      { icon: Settings, label: "Settings", id: "settings", path: "/settings" },
    ]
  },
  {
    label: "Markets",
    items: [
      { icon: LineChart, label: "Spot Markets", id: "spot-markets", path: "/spot-markets" },
      { icon: TrendingUp, label: "Futures Markets", id: "futures-markets", path: "/futures-markets" },
      { icon: Sparkles, label: "New Listings", id: "new-listings", path: "/new-listings" },
      { icon: BarChart3, label: "Top Movers", id: "top-movers", path: "/top-movers" },
    ]
  },
  {
    label: "Trading",
    items: [
      { icon: LineChart, label: "Spot Trading", id: "spot-trading", path: "/spot-trading" },
      { icon: TrendingUp, label: "Margin Trading", id: "margin-trading", path: "/margin-trading" },
      { icon: BrainCircuit, label: "Strategy Trading", id: "strategy-trading", path: "/strategy-trading" },
      { icon: Users, label: "P2P", id: "p2p", path: "/p2p" },
      { icon: PlayCircle, label: "Trading Bots", id: "bots", path: "/bots" },
      { icon: ArrowLeftRight, label: "Crypto Converter", id: "crypto-converter", path: "/crypto-converter" },
    ]
  },
  {
    label: "Derivatives",
    items: [
      { icon: ArrowLeftRight, label: "USDT-M Futures", id: "usdt-futures", path: "/usdt-futures" },
      { icon: Wallet, label: "COIN-M Futures", id: "coin-futures", path: "/coin-futures" },
      { icon: GitBranch, label: "Options", id: "options", path: "/options" },
      { icon: Trophy, label: "Leaderboard", id: "leaderboard", path: "/leaderboard" },
    ]
  },
  {
    label: "Earn",
    items: [
      { icon: Percent, label: "Simple Earn", id: "simple-earn", path: "/simple-earn" },
      { icon: Repeat, label: "Auto-Invest", id: "auto-invest", path: "/auto-invest" },
      { icon: BadgePercent, label: "Staking", id: "staking", path: "/staking" },
      { icon: Droplets, label: "Liquidity Farming", id: "liquidity-farming", path: "/liquidity-farming" },
    ]
  },
  {
    label: "Tools & Resources",
    items: [
      { icon: CreditCard, label: "Vertex Card", id: "vertex-card", path: "/vertex-card" },
      { icon: Bell, label: "Alerts", id: "alerts", path: "/alerts" },
      { icon: KeyRound, label: "API Management", id: "api", path: "/api-management" },
      { icon: HelpCircle, label: "Support", id: "support", path: "/support" },
    ]
  },
  {
    label: "Other",
    items: [
      { icon: PlayCircle, label: "Demo", id: "demo", path: "/demo" },
      { icon: HelpCircle, label: "Support", id: "support", path: "/support" },
      { icon: Settings, label: "Settings", id: "settings", path: "/settings" },
    ]
  }
];

interface SidebarProps {
  navItems?: NavItem[];
}

const DashboardSidebar = ({ navItems = defaultNavCategories }: SidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check if screen is mobile-sized
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-collapse sidebar on mobile if not already collapsed
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  // Extract the active tab from the location pathname or query parameters
  const getActiveTab = () => {
    const pathname = location.pathname;

    if (pathname === '/dashboard') {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      return tab || "dashboard";
    }

    // Check if we're on a specific page
    if (pathname === '/market') return 'markets';
    if (pathname === '/assets') return 'assets';
    if (pathname === '/settings') return 'settings';
    if (pathname === '/demo') return 'demo';
    if (pathname === '/alerts') return 'alerts';
    if (pathname === '/new-listings') return 'newlistings'; // Added new-listings check
    if (pathname === '/futures-markets') return 'futures-markets'; //Added futures-markets check

    // Log the current pathname for debugging
    console.log("Current active tab:", pathname);

    // Default to dashboard if no match is found
    return "dashboard";
  };

  const activeTab = getActiveTab();

  // Handle toggling sidebar on mobile
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Mobile menu button - fixed at the top left corner */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="fixed top-4 left-4 z-50 rounded-full bg-background/80 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-white/10 lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      <aside className={cn(
        "flex flex-col bg-background/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300 h-screen z-40",
        collapsed ? "w-64 md:w-48" : "w-[320px] md:w-80",
        isMobile ? "fixed left-0 top-0" : "relative",
        isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0",
        "shadow-xl shadow-black/10"
      )}>
        <div className={cn(
          "flex items-center h-16 px-3 mb-4",
          collapsed ? "justify-between" : "justify-between"
        )}>
          <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
            <img src="/favicon.svg" alt="Vertex Trading" className="h-8 w-auto" /> {/* Favicon as logo */}
            <div className={cn("font-bold text-white ml-2", collapsed ? "text-sm" : "text-lg")}>
              {collapsed ? "Vertex" : "Vertex Trading"}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/70 hover:text-white hover:bg-white/10"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="px-2 flex-1 overflow-y-auto smooth-scroll">
          {defaultNavCategories.map((category) => (
            <div key={category.label} className="mb-4">
              <h3 className="text-xs font-semibold text-white/50 px-3 mb-2">{category.label}</h3>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    asChild
                    className={cn(
                      "justify-start text-white/70 hover:text-white hover:bg-white/10",
                      activeTab === item.id && "bg-white/10 text-white",
                      "h-11 px-2",
                    )}
                    onClick={() => isMobile && setMobileOpen(false)}
                  >
                    <Link to={item.path} className="flex items-center w-full">
                      <div className="flex items-center w-full">
                        <item.icon className={cn("h-4 w-4 flex-shrink-0", collapsed ? "mr-1" : "mr-2")} />
                        <span className={cn("font-medium whitespace-nowrap overflow-hidden text-ellipsis", collapsed ? "text-xs" : "text-xs")}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {!collapsed && !isMobile && (
          <div className="mt-auto p-4">
            <div className="rounded-lg p-3 bg-white/5">
            </div>
          </div>
        )}
      </aside>

      {/* Overlay when mobile sidebar is open */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default DashboardSidebar;

// Placeholder page components (replace with actual implementations)
const StrategyTradingPage = () => <div>Strategy Trading Page Content</div>;
const P2PPage = () => <div>P2P Trading Page Content</div>;
const USDTFuturesPage = () => <div>USDT Futures Page Content</div>;
const CoinFuturesPage = () => <div>Coin Futures Page Content</div>;
const OptionsPage = () => <div>Options Page Content</div>;
const LeaderboardPage = () => <div>Leaderboard Page Content</div>;
const SimpleEarnPage = () => <div>Simple Earn Page Content</div>;
const AutoInvestPage = () => <div>Auto Invest Page Content</div>;
const LiquidityFarmingPage = () => <div>Liquidity Farming Page Content</div>;
const StakingPage = () => <div>Staking Page Content</div>;
const VertexCardPage = () => <div>Vertex Card Page Content</div>;
const APIManagementPage = () => <div>API Management Page Content</div>;