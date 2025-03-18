import { LogOut, Bell, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardContext } from "./DashboardLayout";
import { signOut } from "firebase/auth"; // Import signOut from Firebase

const DashboardHeader = () => {
  const { isDemoMode } = useDashboardContext();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full px-6 py-3 bg-background/80 backdrop-blur-lg border-b border-white/10 flex items-center justify-between">
      <div className="flex items-center">
        {isDemoMode && (
          <div className="bg-amber-500/20 text-amber-500 text-sm font-medium px-3 py-1 rounded-full">
            Demo Mode
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
          <User className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
          <Settings className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;