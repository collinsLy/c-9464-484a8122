import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  ChevronRight, ChevronLeft, Home, LineChart, BarChart3, 
  Wallet, CreditCard, TrendingUp, History, Settings, PlayCircle
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  id: string;
  path: string;
}

const defaultNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", id: "dashboard", path: "/dashboard" },
  { icon: LineChart, label: "Markets", id: "markets", path: "/market" },
  { icon: TrendingUp, label: "Trading", id: "trading", path: "/trading" },
  { icon: Wallet, label: "Assets", id: "assets", path: "/assets" },
  { icon: CreditCard, label: "Deposit", id: "deposit", path: "/deposit" },
  { icon: CreditCard, label: "Withdraw", id: "withdraw", path: "/withdraw" },
  { icon: BarChart3, label: "Bots & Strategies", id: "bots", path: "/bots" },
  { icon: PlayCircle, label: "Demo", id: "demo", path: "/demo" },
  { icon: History, label: "History", id: "history", path: "/history" },
  { icon: Settings, label: "Support", id: "support", path: "/support" },
  { icon: Settings, label: "Settings", id: "settings", path: "/settings" },
];

interface SidebarProps {
  navItems?: NavItem[];
}

const DashboardSidebar = ({ navItems = defaultNavItems }: SidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
    
    // Default to dashboard if no match is found
    return "dashboard";
  };
  
  const activeTab = getActiveTab();

  return (
    <aside className={cn(
      "flex flex-col bg-background/40 backdrop-blur-lg border-r border-white/10 transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className={cn(
        "flex items-center h-14 px-3 mb-8",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && <div className="text-xl font-bold text-white">Vertex Trading</div>}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <nav className="space-y-1.5 px-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-white/10",
              activeTab === item.id && "bg-white/10 text-white",
              collapsed && "justify-center px-0"
            )}
          >
            <Link to={item.path}>
              <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          </Button>
        ))}
      </nav>
      
      {!collapsed && (
        <div className="mt-auto p-4">
          <div className="rounded-lg p-4 bg-white/5">
            <p className="text-sm text-white/90 font-medium mb-2">Pro Trading Upgrade</p>
            <p className="text-xs text-white/60 mb-3">Access advanced tools and higher limits with Pro Trading.</p>
            <Button className="w-full" size="sm">
              Upgrade Now
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;
