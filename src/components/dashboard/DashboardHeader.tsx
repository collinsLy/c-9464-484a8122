
import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { NotificationService } from '@/lib/notification-service';
import SearchBar from '@/components/search/SearchBar';

export interface DashboardHeaderProps {}

export const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
  const [userName, setUserName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;
    let unsubscribeNotifications: (() => void) | null = null;

    // Fetch user data and notifications
    const fetchUserDataAndNotifications = async () => {
      try {
        const currentUser = auth.currentUser;
        const uid = currentUser?.uid || localStorage.getItem('userId');
        
        if (!uid) return;

        // Subscribe to user data from Firestore
        const userRef = doc(db, 'users', uid);
        unsubscribeUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setUserName(userData.fullName || userData.displayName || 'User');
            setUserAvatar(userData.profilePhoto || userData.photoURL || '');
          }
        });
        
        // Subscribe to notifications collection with error handling
        const notificationsQuery = query(
          collection(db, 'p2pNotifications'),
          where('userId', '==', uid),
          orderBy('createdAt', 'desc')
        );
        
        unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
          try {
            const notificationsList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              message: doc.data().message || doc.data().title || 'New notification',
              time: doc.data().createdAt || new Date().toISOString(),
              read: doc.data().read || false
            }));
            
            // Set notifications or fallback to welcome notification
            if (notificationsList.length > 0) {
              setNotifications(notificationsList);
              
              // Play notification sound for new unread notifications (only once)
              const hasUnread = notificationsList.some(notification => !notification.read);
              if (hasUnread && notifications.length === 0) {
                NotificationService.playSound('notification', 0.3);
              }
            } else {
              // Fallback: check general notifications collection
              const generalNotificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', uid),
                orderBy('timestamp', 'desc')
              );
              
              getDocs(generalNotificationsQuery).then(generalSnapshot => {
                if (!generalSnapshot.empty) {
                  const generalNotifications = generalSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    message: doc.data().message || doc.data().body || doc.data().title || 'New notification',
                    time: doc.data().timestamp || doc.data().createdAt || new Date().toISOString(),
                    read: doc.data().isRead !== undefined ? doc.data().isRead : doc.data().read || false
                  }));
                  setNotifications(generalNotifications);
                } else {
                  // Welcome notification for new users
                  setNotifications([
                    { 
                      id: 'welcome', 
                      message: 'Welcome to Vertex Trading Platform! 🚀', 
                      read: false, 
                      time: new Date().toISOString() 
                    }
                  ]);
                }
              }).catch(error => {
                console.error('Error fetching general notifications:', error);
                // Still show welcome notification on error
                setNotifications([
                  { 
                    id: 'welcome', 
                    message: 'Welcome to Vertex Trading Platform! 🚀', 
                    read: false, 
                    time: new Date().toISOString() 
                  }
                ]);
              });
            }
          } catch (error) {
            console.error('Error processing notifications:', error);
          }
        }, (error) => {
          console.error('Error listening to notifications:', error);
          // Show fallback notification on error
          setNotifications([
            { 
              id: 'error', 
              message: 'Unable to load notifications. Please refresh the page.', 
              read: false, 
              time: new Date().toISOString() 
            }
          ]);
        });
        
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    fetchUserDataAndNotifications();

    // Cleanup function
    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, []);

  const handleSignOut = () => {
    // Clear local authentication
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    
    // Sign out from Firebase
    auth.signOut()
      .then(() => {
        // Redirect to home page
        navigate('/');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    
    // Mark all notifications as viewed (not necessarily read) when opening the panel
    if (!showNotifications && notifications.some(n => !n.read)) {
      // Optional: Play a subtle sound when opening notifications
      NotificationService.playSound('notification', 0.1);
    }
  };

  // Generate initials from user name for avatar fallback
  const getInitials = () => {
    if (!userName) return 'U';
    const names = userName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // Update local state first for immediate UI feedback
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Skip updating welcome/error notifications
      if (notificationId === 'welcome' || notificationId === 'error') {
        return;
      }
      
      // Update the notification in Firestore
      const currentUser = auth.currentUser;
      const uid = currentUser?.uid || localStorage.getItem('userId');
      
      if (!uid) return;
      
      // Try to update in p2pNotifications collection first
      try {
        const notificationRef = doc(db, 'p2pNotifications', notificationId);
        await updateDoc(notificationRef, { 
          read: true,
          readAt: new Date().toISOString()
        });
      } catch (p2pError) {
        // If not found in p2pNotifications, try in notifications collection
        try {
          const generalNotificationRef = doc(db, 'notifications', notificationId);
          await updateDoc(generalNotificationRef, { 
            isRead: true,
            read: true,
            readAt: new Date().toISOString()
          });
        } catch (generalError) {
          console.error('Error marking notification as read in both collections:', {
            p2pError,
            generalError
          });
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert local state on error
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: false } 
            : notification
        )
      );
    }
  };

  return (
    <header className="h-16 px-4 border-b border-gray-800 flex items-center justify-between">
      {/* Search */}
      <div className="md:w-72 hidden md:flex">
        <SearchBar className="w-full" />
      </div>

      {/* Mobile search button - opens search modal/drawer */}
      <div className="md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400"
          onClick={() => navigate('/search')}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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
          <PopoverContent className="w-80 p-0 bg-[#0F1115]/95 backdrop-blur-lg border-white/10 text-white shadow-xl" align="end">
            <div className="p-3 border-b border-gray-800/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">Notifications</h3>
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge className="bg-blue-600 text-xs px-2 py-1">
                    {notifications.filter(n => !n.read).length} new
                  </Badge>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-800/30 last:border-none hover:bg-gray-800/50 cursor-pointer transition-colors duration-200 ${
                      !notification.read ? 'bg-blue-900/20 border-l-2 border-l-blue-500' : ''
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white leading-relaxed">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>🕒</span>
                          {new Date(notification.time).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs mt-1 opacity-75">You'll see updates here when they arrive</p>
                </div>
              )}
              {notifications.length > 10 && (
                <div className="p-2 text-center border-t border-gray-800/30">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300">
                    View all notifications
                  </Button>
                </div>
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
                {userAvatar ? (
                  <AvatarImage src={userAvatar} alt={userName} />
                ) : null}
                <AvatarFallback className="bg-gray-800">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm hidden md:inline-block">{userName || 'User'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0 bg-[#0F1115]/90 backdrop-blur-lg border-white/10 text-white" align="end">
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
