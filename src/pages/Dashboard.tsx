import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AccountOverview from "@/components/dashboard/AccountOverview";
import MarketChart from "@/components/dashboard/MarketChart";
import { CryptoConverter } from '@/components/trading/CryptoConverter';
import { CopyTrading } from '@/components/trading/CopyTrading';
import AssetsList from "@/components/dashboard/AssetsList";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import TradingPanel from "@/components/dashboard/TradingPanel";
import AutomatedTrading from "@/components/dashboard/AutomatedTrading";
import BinanceOrderBook from "@/components/markets/BinanceOrderBook";
import { Card, CardContent } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp, doc, updateDoc } from "firebase/firestore";
import { NotificationService } from "@/lib/notification-service";
import { PortfolioAnalytics } from "@/components/dashboard/PortfolioAnalytics";


const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const notificationListenerRef = useRef<(() => void) | null>(null);
  const permissionRequested = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for welcome notification flag on component mount
  useEffect(() => {
    const showWelcome = localStorage.getItem('showWelcome');
    if (showWelcome === 'true') {
      // Show welcome notification
      toast({
        title: "Welcome to Vertev Trading!",
        description: "Your account has been successfully created. Start trading now!",
      });
      // Remove the flag so notification doesn't show again on refresh
      localStorage.removeItem('showWelcome');
    }

    // Request notification permissions
    if (!permissionRequested.current) {
      NotificationService.requestPermission();
      permissionRequested.current = true;
    }
  }, []);

  // Subscribe to notifications
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Clean up previous listener if it exists
    if (notificationListenerRef.current) {
      notificationListenerRef.current();
      notificationListenerRef.current = null;
    }

    // Listen for new notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    // Set up real-time listener
    notificationListenerRef.current = onSnapshot(notificationsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notification = change.doc.data();

          // Show notification for new incoming transfers
          if (notification.type === 'transfer') {
            NotificationService.notifyFundReceived(
              notification.amount,
              notification.asset || 'USDT',
              notification.senderName || 'Another user',
              {
                showToast: true,
                playSound: true,
                soundType: 'transfer'
              }
            );

            // Mark the notification as read
            updateDoc(doc(db, 'notifications', change.doc.id), { isRead: true })
              .catch(error => console.error("Error marking notification as read:", error));
          }
        }
      });

      // Update unread notifications flag
      setHasUnreadNotifications(snapshot.size > 0);
    }, (error) => {
      console.error("Error listening for notifications:", error);
    });

    // Clean up on unmount
    return () => {
      if (notificationListenerRef.current) {
        notificationListenerRef.current();
        notificationListenerRef.current = null;
      }
    };
  }, []);

  // Determine which tab should be active based on URL
  const getActiveTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab || "dashboard";
  };

  const activeTab = getActiveTab();

  // Handle tab changes
  useEffect(() => {
    // If the URL doesn't have a tab parameter but we're not on the dashboard tab,
    // update the URL to include the active tab
    const params = new URLSearchParams(location.search);
    const currentTab = params.get('tab');

    if (activeTab !== "dashboard" && currentTab !== activeTab) {
      navigate(`/dashboard?tab=${activeTab}`, { replace: true });
    } else if (activeTab === "dashboard" && currentTab) {
      navigate('/dashboard', { replace: true });
    }

    // Debug
    console.log("Current active tab:", activeTab);
  }, [activeTab, location.search, navigate]);

  // Render different content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            {/* Account Overview Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <MarketChart 
                  selectedSymbol={selectedSymbol} 
                  selectedTimeframe={selectedTimeframe}
                  onSymbolChange={setSelectedSymbol}
                  onTimeframeChange={setSelectedTimeframe}
                />
              </div>
              <div className="xl:col-span-1">
                <AssetsList />
              </div>
            </div>
            <PortfolioAnalytics />
          </>
        );

      case "trading":
        return (
          <div className="space-y-6">
            <MarketChart 
              selectedSymbol={selectedSymbol} 
              selectedTimeframe={selectedTimeframe}
              onSymbolChange={setSelectedSymbol}
              onTimeframeChange={setSelectedTimeframe}
            />
            <div className="max-w-md mx-auto">
              <CryptoConverter />
            </div>
            <CopyTrading />
          </div>
        );

      case "bots":
        return <AutomatedTrading />;

      case "history":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
            <TransactionHistory />
          </div>
        );

      case "funding":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Deposit & Withdraw</h2>
            <p className="text-white/70">Manage your funds securely.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-background/40 backdrop-blur-lg border-white/10">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-white mb-4">Deposit Funds</h3>
                  <p className="text-white/70 mb-4">
                    Add funds to your account using one of our secure payment methods.
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="bg-white/5 p-3 text-center">
                        <p className="text-sm font-medium text-white">M-Pesa</p>
                      </Card>
                      <Card className="bg-white/5 p-3 text-center">
                        <p className="text-sm font-medium text-white">Airtel</p>
                      </Card>
                      <Card className="bg-white/5 p-3 text-center">
                        <p className="text-sm font-medium text-white">Credit Card</p>
                      </Card>
                    </div>
                    <a 
                      href="/deposit"
                      className="inline-block w-full"
                    >
                      <button className="w-full bg-[#F2FF44] text-black font-medium py-2 rounded hover:bg-[#E2EF34]">
                        Deposit Now
                      </button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/40 backdrop-blur-lg border-white/10">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-white mb-4">Withdraw Funds</h3>
                  <p className="text-white/70 mb-4">
                    Withdraw your funds to your preferred payment method.
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="bg-white/5 p-3 text-center">
                        <p className="text-sm font-medium text-white">Bank Transfer</p>
                      </Card>
                      <Card className="bg-white/5 p-3 text-center">
                        <p className="text-sm font-medium text-white">M-Pesa</p>
                      </Card>
                      <Card className="bg-white/5 p-3 text-center">
                        <p className="text-sm font-medium text-white">Airtel</p>
                      </Card>
                    </div>
                    <button className="w-full bg-white/10 text-white font-medium py-2 rounded hover:bg-white/20">
                      Withdraw Funds
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      // Add additional cases for other tabs as needed
      default:
        return (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-white/70">This feature is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {/* Dynamic Content based on active tab */}
      <div className="space-y-6">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;