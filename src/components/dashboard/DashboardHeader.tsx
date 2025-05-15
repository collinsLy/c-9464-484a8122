import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Search, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export interface DashboardHeaderProps {}

export const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
  const [userName, setUserName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const uid = localStorage.getItem('userId');
        if (!uid) return;

        // Here you would normally fetch user data from a service
        // For now we'll use mock data
        setUserName('User');
        setUserAvatar('');

        // Mock notifications
        setNotifications([
          { id: 1, message: 'Welcome to Vertex', read: false, time: new Date().toISOString() },
          { id: 2, message: 'Your deposit has been confirmed', read: true, time: new Date().toISOString() }
        ]);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = () => {
    // Clear local authentication
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');

    // Redirect to home page
    navigate('/');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="h-16 px-4 border-b border-gray-800 flex items-center justify-between">
      {/* Search */}
      <div className="md:w-72 hidden md:flex">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full bg-gray-900 rounded-md border border-gray-800 pl-8 pr-4 py-2 focus:outline-none focus:border-blue-600 text-sm"
          />
        </div>
      </div>

      {/* Mobile search icon */}
      <div className="md:hidden">
        <Button variant="ghost" size="icon" className="text-gray-400">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-gray-400"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-600">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-2 border-b border-gray-800">
              <h3 className="font-medium">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2 border-b border-gray-800 last:border-none hover:bg-gray-800 cursor-pointer ${
                      !notification.read ? 'bg-gray-900' : ''
                    }`}
                  >
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.time).toLocaleTimeString()} - {new Date(notification.time).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No notifications</div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* User */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-gray-400 pr-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-gray-800">
                  {userName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm hidden md:inline-block">{userName || 'User'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="end">
            <div className="p-2 border-b border-gray-800">
              <p className="text-sm font-medium">{userName || 'User'}</p>
            </div>
            <div className="p-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm" 
                onClick={() => navigate('/settings')}
              >
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm" 
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

export default DashboardHeader;