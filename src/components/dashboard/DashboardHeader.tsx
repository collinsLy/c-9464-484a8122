import React from 'react';
import { LogOut, Bell, User, Settings, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDashboardContext } from "./DashboardLayout";
import { signOut } from "firebase/auth";
import { auth } from '../../lib/firebase';
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";


const DashboardHeader = () => {
  const [profileOpen, setProfileOpen] = React.useState(false);
  const navigate = useNavigate();
  const { isDemoMode } = useDashboardContext();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();
  const [userUid, setUserUid] = useState("");

  useEffect(() => {
    // Get current user UID when component loads
    setUserUid(auth.currentUser?.uid || "");
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const copyUidToClipboard = () => {
    navigator.clipboard.writeText(userUid || "");
    toast({
      title: "Copied!",
      description: "Your UID has been copied to clipboard",
    });
  };

  return (
    <header className="sticky top-0 z-30 w-full px-6 py-3 bg-background/80 backdrop-blur-lg border-b border-white/10 flex items-center justify-between">
      <div className="flex items-center">
        {isDemoMode && (
          <div className="bg-amber-500/20 text-amber-500 text-sm font-medium px-3 py-1 rounded-full">
            Demo Mode
          </div>
        )}
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="Whalex" className="h-7 w-7" />
          <div className="text-xl font-bold">Whalex</div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* UID Display */}
        <div className="hidden sm:flex items-center bg-white/5 rounded-md px-2 py-1 mr-2">
          <span className="text-xs font-mono text-white/70 mr-1">UID:</span>
          <code className="text-xs font-mono text-white/90 truncate max-w-[80px]">{userUid}</code>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-1 text-white/70 hover:text-white"
            onClick={copyUidToClipboard}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10" >
              <Bell className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="cursor-pointer flex items-start gap-3 p-3 max-w-[300px] sm:max-w-[350px]">
              <div className="h-2 w-2 mt-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
              <div className="space-y-1 overflow-hidden">
                <p className="font-medium text-sm">New Payment Methods Available</p>
                <p className="text-xs text-white/70 line-clamp-2">Now accepting crypto, mobile money, cards & bank transfers</p>
                <p className="text-xs text-white/50">Just now</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile UID Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="sm:hidden">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 px-2">
              <span className="text-xs font-mono">UID</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer flex flex-col items-start p-3">
              <p className="font-medium text-sm mb-1">Your UID</p>
              <code className="text-xs font-mono bg-white/10 p-1 rounded w-full overflow-hidden text-ellipsis">
                {userUid || 'Loading...'}
              </code>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-xs w-full"
                onClick={copyUidToClipboard}
              >
                Copy UID
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => navigate('/settings')}>
          <User className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => navigate('/settings')}>
          <Settings className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>


        {/* Profile Dialog */}
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">John Doe</h3>
                  <p className="text-sm text-white/70">john.doe@example.com</p>
                </div>
              </div>
              <div className="space-y-2">
                <Link to="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        {/* Settings Dialog remains unchanged */}
      </div>
    </header>
  );
};

export default DashboardHeader;