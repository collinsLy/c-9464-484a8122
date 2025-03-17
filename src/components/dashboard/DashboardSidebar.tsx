
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  id: string;
}

interface SidebarProps {
  navItems: NavItem[];
}

const DashboardSidebar = ({ navItems }: SidebarProps) => {
  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-background/40 backdrop-blur-lg border-r border-white/10 p-4">
      <div className="flex items-center h-14 px-3 mb-8">
        <div className="text-xl font-bold text-white">Vertex Trading</div>
      </div>
      
      <nav className="space-y-1.5">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-white/10",
              item.id === "dashboard" && "bg-white/10 text-white"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>
      
      <div className="mt-auto">
        <div className="rounded-lg p-4 bg-white/5">
          <p className="text-sm text-white/90 font-medium mb-2">Pro Trading Upgrade</p>
          <p className="text-xs text-white/60 mb-3">Access advanced tools and higher limits with Pro Trading.</p>
          <Button className="w-full" size="sm">
            Upgrade Now
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
