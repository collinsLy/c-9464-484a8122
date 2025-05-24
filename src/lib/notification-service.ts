import { ref, onValue, push, update, get, child, remove } from 'firebase/database';
import { db } from './firebase';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

export const NotificationService = {
  // Add a new notification
  addNotification: async (notification: Notification) => {
    try {
      const notificationsRef = ref(db, `notifications/${notification.userId}`);
      const newNotifRef = push(notificationsRef);
      await update(newNotifRef, {
        ...notification,
        id: newNotifRef.key,
        time: notification.time || new Date().toISOString(),
      });
      return newNotifRef.key;
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  },

  // Get all notifications for a user
  getUserNotifications: async (userId: string) => {
    try {
      const notificationsRef = ref(db, `notifications/${userId}`);
      const snapshot = await get(notificationsRef);

      if (snapshot.exists()) {
        const notifications: Notification[] = [];
        snapshot.forEach((childSnapshot) => {
          notifications.push({
            id: childSnapshot.key || undefined,
            ...childSnapshot.val(),
          });
        });
        return notifications.sort((a, b) => 
          new Date(b.time).getTime() - new Date(a.time).getTime()
        );
      }
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Subscribe to notifications for a user
  subscribeToNotifications: (userId: string, callback: (notifications: Notification[]) => void) => {
    const notificationsRef = ref(db, `notifications/${userId}`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notifications: Notification[] = [];

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          notifications.push({
            id: childSnapshot.key || undefined,
            ...childSnapshot.val(),
          });
        });
      }

      // Sort by time (newest first)
      const sortedNotifications = notifications.sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );

      callback(sortedNotifications);
    });

    return unsubscribe;
  },

  // Mark a notification as read
  markAsRead: async (userId: string, notificationId: string) => {
    try {
      const notificationRef = ref(db, `notifications/${userId}/${notificationId}`);
      await update(notificationRef, { read: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string) => {
    try {
      const notificationsRef = ref(db, `notifications/${userId}`);
      const snapshot = await get(notificationsRef);

      if (snapshot.exists()) {
        const updates: Record<string, any> = {};

        snapshot.forEach((childSnapshot) => {
          updates[`${childSnapshot.key}/read`] = true;
        });

        await update(notificationsRef, updates);
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete a notification
  deleteNotification: async (userId: string, notificationId: string) => {
    try {
      const notificationRef = ref(db, `notifications/${userId}/${notificationId}`);
      await remove(notificationRef);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get unread notification count
  getUnreadCount: async (userId: string) => {
    try {
      const notificationsRef = ref(db, `notifications/${userId}`);
      const snapshot = await get(notificationsRef);

      let unreadCount = 0;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const notification = childSnapshot.val();
          if (!notification.read) {
            unreadCount++;
          }
        });
      }

      return unreadCount;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  // Format relative time (e.g., "5 minutes ago")
  formatRelativeTime: (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    // Format as date string for older notifications
    return date.toLocaleDateString();
  }
};

export default NotificationService;