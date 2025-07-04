import { toast } from "@/components/ui/use-toast";

// Types for notifications
export interface NotificationOptions {
  showToast?: boolean;
  body?: string;
  icon?: string;
  priority?: 'low' | 'normal' | 'high';
  persistent?: boolean;
}

// Notification types based on the blueprint
export type NotificationType = 
  | 'ORDER_FILLED' 
  | 'ORDER_PLACED' 
  | 'ORDER_CANCELED'
  | 'P2P_TRANSACTION_UPDATE'
  | 'BALANCE_UPDATED'
  | 'PRICE_THRESHOLD_HIT'
  | 'MARKET_MAINTENANCE'
  | 'SUSPICIOUS_LOGIN'
  | 'KYC_UPDATE'
  | 'WITHDRAWAL_PROCESSING'
  | 'DEPOSIT_CONFIRMED'
  | 'SYSTEM_ALERT';



export class NotificationService {
  // Check if browser supports notifications
  static isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  // Request notification permission
  static async requestPermission(): Promise<boolean> {
    if (!this.isNotificationSupported()) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Send a withdrawal notification
  static async sendWithdrawalNotification(userId: string, transaction: any): Promise<void> {
    try {
      // Create notification message
      const cryptoAmount = transaction.cryptoAmount || null;
      const cryptoType = transaction.crypto || null;
      const amount = transaction.amount || null;

      let notificationMessage = "Your withdrawal has been submitted and is being processed";
      if (cryptoAmount && cryptoType) {
        notificationMessage = `Your withdrawal of ${cryptoAmount} ${cryptoType} is being processed`;
      } else if (amount) {
        notificationMessage = `Your withdrawal of $${amount} is being processed`;
      }

      // Store notification in Firebase for the notification icon
      const { addDoc, collection } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      // Store in both collections for better compatibility
      const notificationData = {
        userId: userId,
        type: 'withdrawal',
        title: 'Withdrawal Processing',
        message: notificationMessage,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        read: false,
        isRead: false,
        txId: transaction.txId,
        amount: cryptoAmount || amount,
        currency: cryptoType || 'USD'
      };

      // Add to notifications collection
      await addDoc(collection(db, 'notifications'), notificationData);

      // Also add to p2pNotifications collection for header compatibility
      await addDoc(collection(db, 'p2pNotifications'), notificationData);

      // Show toast notification
      toast({
        title: "Withdrawal Processing",
        description: notificationMessage,
        variant: "default",
        className: "notification-toast",
      });

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('Withdrawal Processing', {
          body: notificationMessage,
          icon: '/favicon.svg'
        });
      }
    } catch (error) {
      console.error('Error sending withdrawal notification:', error);
    }
  }

  // Show a notification for fund transfer
  static notifyFundReceived(
    amount: number,
    currency: string, 
    senderName: string, 
    options: NotificationOptions = { showToast: true }
  ) {
    // Show toast notification
    if (options.showToast) {
      toast({
        title: `Received ${amount} ${currency}`,
        description: `${senderName} sent you ${amount} ${currency}`,
        variant: "default",
        className: "notification-toast",
      });
    }

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('Funds Received', {
        body: `${senderName} sent you ${amount} ${currency}`,
        icon: '/favicon.svg'
      });
    }
  }



  // Store notification in Firebase
  static async storeNotificationInFirebase(
    userId: string,
    type: string,
    title: string,
    message: string,
    additionalData: any = {}
  ): Promise<void> {
    try {
      const { addDoc, collection } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      await addDoc(collection(db, 'notifications'), {
        userId: userId,
        type: type,
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        read: false,
        isRead: false,
        ...additionalData
      });
    } catch (error) {
      console.error('Error storing notification in Firebase:', error);
    }
  }

  // Enhanced notification sending based on type
  static async sendNotification(
    type: NotificationType, 
    title: string, 
    message: string, 
    options: NotificationOptions = {},
    userId?: string
  ): Promise<void> {
    try {
      // Store notification in Firebase if userId is provided
      if (userId) {
        await this.storeNotificationInFirebase(userId, type, title, message);
      }

      // Show toast notification
      if (options.showToast !== false) {
        toast({
          title,
          description: message,
          variant: type.includes('ERROR') || type === 'SUSPICIOUS_LOGIN' ? "destructive" : "default",
          className: "notification-toast",
        });
      }

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: options.icon || '/favicon.svg',
          tag: type, // Prevents duplicate notifications of same type
          requireInteraction: options.persistent || false
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Order-related notifications
  static notifyOrderFilled(orderId: string, price: number, amount: number, symbol: string): void {
    this.sendNotification(
      'ORDER_FILLED',
      'Order Filled! 🎉',
      `Your order for ${amount} ${symbol} was filled at $${price.toFixed(2)}`,
      {}
    );
  }

  static notifyPriceAlert(symbol: string, price: number, threshold: number): void {
    this.sendNotification(
      'PRICE_THRESHOLD_HIT',
      `Price Alert: ${symbol} 📈`,
      `${symbol} has reached your target price of $${threshold}. Current price: $${price}`,
      { priority: 'high' }
    );
  }

  static notifySystemMaintenance(message: string): void {
    this.sendNotification(
      'MARKET_MAINTENANCE',
      'System Maintenance 🔧',
      message,
      { persistent: true }
    );
  }

  static notifySecurityAlert(message: string): void {
    this.sendNotification(
      'SUSPICIOUS_LOGIN',
      'Security Alert! 🚨',
      message,
      { priority: 'high', persistent: true }
    );
  }

  // Show desktop notification if supported
  static async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    try {
      // Check if browser supports notifications
      if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notifications");
        return;
      }

      // Check if permission is granted
      if (Notification.permission === "granted") {
        new Notification(title, options);
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification(title, options);
        }
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }


}

export default NotificationService;