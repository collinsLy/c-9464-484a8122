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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


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


//pages/referral.tsx
import React from 'react';

const ReferralPage = () => {
  return (
    <div>
      <h1>Referral Page</h1>
      {/* Add referral code input and display logic here */}
    </div>
  );
};

export default ReferralPage;


//components/sidebar/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside>
      <ul>
        {/* Existing sidebar items */}
        <li><Link to="/referral">Referral</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;


//App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './pages/DashboardLayout';
import ReferralPage from './pages/referral';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />} />
        <Route path="/referral" element={<ReferralPage />} />
        {/* other routes */}
      </Routes>
    </Router>
  );
};

export default App;


// SignInForm.tsx
import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

const SignInForm = () => {
    const navigate = useNavigate();
    const [referralCode, setReferralCode] = useState('');
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const referralCodeFromUrl = urlParams.get('referral');

    // ... existing sign-in logic ...

    if(referralCodeFromUrl){
        setReferralCode(referralCodeFromUrl);
        //send referral code to backend
    }

    return (
        // ... your existing JSX ...
        <input type="text" placeholder='Referral Code' value={referralCode} onChange={(e) => setReferralCode(e.target.value)}/>
    );
};

export default SignInForm;

//User registration modification
// ... in your user registration function ...
const handleRegistration = async (userData) => {
    // ... existing registration logic ...
    const referralCode =  //get referral code from SignInForm state or URL
    await registerUser({...userData, referralCode});
}