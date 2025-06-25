import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftRight, Home, PlayCircle, Wallet, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileBottomNav = () => {
  const { pathname } = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: PlayCircle, label: 'Bots', path: '/bots' },
    { icon: Wallet, label: 'Assets', path: '/assets' },
    { icon: ArrowLeftRight, label: 'Convert', path: '/dashboard/converter' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 md:hidden z-50 w-full">
      <div className="grid grid-cols-4 h-16 w-full max-w-full">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center text-xs w-full h-full touch-manipulation",
              pathname === item.path 
                ? "text-white" 
                : "text-muted-foreground hover:text-white"
            )}
            style={{ touchAction: 'manipulation' }}
          >
            <item.icon className={cn("h-5 w-5 mb-0.5", pathname === item.path ? "text-white" : "")} />
            <span className="text-xs leading-none">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;