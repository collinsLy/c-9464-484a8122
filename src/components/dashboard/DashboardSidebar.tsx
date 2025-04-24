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
} from "lucide-react";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  { icon: Users, label: "Referral", id: "referral", path: "/referral" }, // Added referral item
];

interface SidebarProps {
  navItems?: NavItem[];
}

const DashboardSidebar = ({ navItems = defaultNavItems }: SidebarProps) => {
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
    if (pathname === '/referral') return 'referral'; //Added referral check

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
        collapsed ? "w-28 md:w-48" : "w-[320px] md:w-80",
        isMobile ? "fixed left-0 top-0" : "relative",
        isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0",
        "shadow-xl shadow-black/10"
      )}>
        <div className={cn(
          "flex items-center h-16 px-3 mb-4",
          collapsed ? "justify-between" : "justify-between"
        )}>
          <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
            <div className={cn("font-bold text-white", collapsed ? "text-sm" : "text-lg")}>
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

        <nav className="space-y-2 px-2 flex-1 overflow-y-auto smooth-scroll">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start text-white/70 hover:text-white hover:bg-white/10",
                activeTab === item.id && "bg-white/10 text-white",
                "h-11 px-3", // Consistent padding for better alignment
              )}
              onClick={() => isMobile && setMobileOpen(false)} // Close sidebar on nav click (mobile)
            >
              <Link to={item.path} className="flex items-center w-full">
                <div className="flex items-center w-full">
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "mr-2" : "mr-3")} />
                  <span className={cn("font-medium whitespace-nowrap overflow-hidden text-ellipsis", collapsed ? "text-xs" : "text-sm")}>
                    {item.label}
                  </span>
                </div>
              </Link>
            </Button>
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

// Add Referral Page Component (Placeholder)
const ReferralPage = () => {
  return (
    <div>
      <h1>Referral Page</h1>
      <p>This is a placeholder for the referral page content.</p>
    </div>
  );
};

export {ReferralPage};