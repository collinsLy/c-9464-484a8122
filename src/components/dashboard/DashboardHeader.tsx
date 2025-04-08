import React from 'react';
import { LogOut, Bell, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDashboardContext } from "./DashboardLayout";
import { signOut } from "firebase/auth";
import { auth } from '../../lib/firebase';
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";


const DashboardHeader = () => {
  const [profileOpen, setProfileOpen] = React.useState(false);
  const navigate = useNavigate();
  const { isDemoMode } = useDashboardContext();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
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
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => setNotificationsOpen(true)}>
          <Bell className="w-5 h-5" />
        </Button>
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

        {/* Notifications Dialog */}
        <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notifications</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                  <Bell className="w-5 h-5 mt-1" />
                  <div>
                    <p className="font-medium">Welcome to Vertex Trading!</p>
                    <p className="text-sm text-white/70">Get started by completing your profile and exploring our trading features.</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

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
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Link to="/settings" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  All Settings
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

export default DashboardHeader;