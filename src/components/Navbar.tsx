
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SignInForm from "./SignInForm";
import OpenAccountForm from "./OpenAccountForm";

const Navbar = () => {
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-white">Vertex Trading</div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-white/80 hover:text-white transition-colors">Markets</a>
          <a href="#" className="text-white/80 hover:text-white transition-colors">Trading</a>
          <a href="#" className="text-white/80 hover:text-white transition-colors">Company</a>
          <a href="#" className="text-white/80 hover:text-white transition-colors">Pricing</a>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-white/80" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuItem className="cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-medium">New Trade Alert</span>
                  <span className="text-sm text-gray-500">BTC/USDT position opened</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-medium">Market Update</span>
                  <span className="text-sm text-gray-500">ETH price increased by 5%</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={openAccount} onOpenChange={setOpenAccount}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                Open your account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Open Trading Account</DialogTitle>
                <DialogDescription>
                  Get started with Vertex Trading in minutes
                </DialogDescription>
              </DialogHeader>
              <OpenAccountForm onSuccess={() => setOpenAccount(false)} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={openSignIn} onOpenChange={setOpenSignIn}>
            <DialogTrigger asChild>
              <Button className="bg-[#F2FF44] text-black hover:bg-[#E2EF34]">
                Sign in
                <LogIn className="w-4 h-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Sign In</DialogTitle>
                <DialogDescription>
                  Access your Vertex Trading account
                </DialogDescription>
              </DialogHeader>
              <SignInForm onSuccess={() => setOpenSignIn(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-background text-white">
            <div className="flex flex-col space-y-6 pt-10">
              <a href="#" className="text-white/80 hover:text-white transition-colors text-lg">Markets</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors text-lg">Trading</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors text-lg">Company</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors text-lg">Pricing</a>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 w-full">
                    Open your account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Open Trading Account</DialogTitle>
                    <DialogDescription>
                      Get started with Vertex Trading in minutes
                    </DialogDescription>
                  </DialogHeader>
                  <OpenAccountForm onSuccess={() => {}} />
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#F2FF44] text-black hover:bg-[#E2EF34] w-full">
                    Sign in
                    <LogIn className="w-4 h-4 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Sign In</DialogTitle>
                    <DialogDescription>
                      Access your Vertex Trading account
                    </DialogDescription>
                  </DialogHeader>
                  <SignInForm onSuccess={() => {}} />
                </DialogContent>
              </Dialog>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
