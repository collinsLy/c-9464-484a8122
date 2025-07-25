import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  limit as firestoreLimit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';

export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  balance: number;
  assets?: Record<string, number>;
  kycStatus?: string;
  kycSubmissionId?: string;
  kycSubmittedAt?: Date;
  country?: string;
  createdAt?: Date;
  lastLogin?: Date;
  ipAddress?: string;
  deviceInfo?: string;
  isBlocked?: boolean;
  isFlagged?: boolean;
  numericalUid?: number;
}

export interface AdminMessage {
  id: string;
  subject: string;
  body: string;
  recipients: string[];
  channel: 'email' | 'in-app' | 'push';
  status: 'draft' | 'sent' | 'failed';
  sentAt?: Date;
  sentBy: string;
  readBy?: string[];
}

export interface AdminAnalytics {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  kycSubmissions: {
    pending: number;
    approved: number;
    rejected: number;
    under_review: number;
  };
  averageKycProcessingTime: number;
  topRejectionReasons: Array<{ reason: string; count: number }>;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  target?: string;
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

export class AdminService {
  // Messaging System
  static async sendTargetedMessage(data: {
    recipients: string[];
    subject: string;
    body: string;
    channel: 'email' | 'in-app' | 'push';
    priority?: 'low' | 'normal' | 'high';
    senderId: string;
  }): Promise<any> {
    try {
      const response = await fetch('/api/admin/send-targeted-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending targeted message:', error);
      throw error;
    }
  }

  static async sendSystemBroadcast(data: {
    subject: string;
    body: string;
    channel: 'email' | 'in-app' | 'push';
    priority?: 'low' | 'normal' | 'high';
    senderId: string;
  }, allUserEmails: string[]): Promise<any> {
    try {
      const response = await fetch('/api/admin/send-system-broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          allUserEmails
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending system broadcast:', error);
      throw error;
    }
  }

  static async sendKYCNotification(data: {
    userEmail: string;
    userName: string;
    status: 'approved' | 'rejected' | 'under_review';
    comments?: string;
    adminId: string;
  }): Promise<any> {
    try {
      const response = await fetch('/api/admin/send-kyc-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending KYC notification:', error);
      throw error;
    }
  }

  static async testMessagingService(): Promise<any> {
    try {
      const response = await fetch('/api/admin/test-messaging');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing messaging service:', error);
      throw error;
    }
  }

  // User Management
  static async getAllUsers(
    filters?: {
      kycStatus?: string;
      country?: string;
      isBlocked?: boolean;
      isFlagged?: boolean;
    },
    pagination?: {
      limit: number;
      lastDoc?: any;
    }
  ): Promise<{ users: AdminUser[]; hasMore: boolean }> {
    try {
      // First try to get users from Firebase Auth via server endpoint
      let authUsers: AdminUser[] = [];
      try {
        const authResponse = await fetch('/api/admin/auth-users');
        if (authResponse.ok) {
          const authData = await authResponse.json();
          authUsers = authData.users || [];
        }
      } catch (authError) {
        console.log('Could not fetch Firebase Auth users, falling back to Firestore');
      }

      // Then get users from Firestore
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

      if (filters?.kycStatus) {
        q = query(q, where('kycStatus', '==', filters.kycStatus));
      }
      if (filters?.country) {
        q = query(q, where('country', '==', filters.country));
      }
      if (filters?.isBlocked !== undefined) {
        q = query(q, where('isBlocked', '==', filters.isBlocked));
      }
      if (filters?.isFlagged !== undefined) {
        q = query(q, where('isFlagged', '==', filters.isFlagged));
      }

      if (pagination?.limit) {
        q = query(q, firestoreLimit(pagination.limit));
      }
      if (pagination?.lastDoc) {
        q = query(q, startAfter(pagination.lastDoc));
      }

      const snapshot = await getDocs(q);
      const firestoreUsers: AdminUser[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        firestoreUsers.push({
          id: doc.id,
          email: data.email || '',
          fullName: data.fullName,
          balance: data.balance || 0,
          assets: data.assets || {},
          kycStatus: data.kycStatus || 'pending',
          kycSubmissionId: data.kycSubmissionId,
          kycSubmittedAt: data.kycSubmittedAt?.toDate(),
          country: data.country,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
          lastLogin: data.lastLogin?.toDate(),
          ipAddress: data.ipAddress,
          deviceInfo: data.deviceInfo,
          isBlocked: data.isBlocked || false,
          isFlagged: data.isFlagged || false,
          numericalUid: data.numericalUid
        });
      });

      // Merge Firebase Auth users with Firestore users, prioritizing Firestore data
      const userMap = new Map<string, AdminUser>();

      // Add auth users first
      authUsers.forEach(user => {
        userMap.set(user.id, user);
      });

      // Override with Firestore data where available
      firestoreUsers.forEach(user => {
        const existingUser = userMap.get(user.id);
        if (existingUser) {
          // Merge auth data with firestore data, prioritizing firestore
          userMap.set(user.id, { ...existingUser, ...user });
        } else {
          userMap.set(user.id, user);
        }
      });

      const allUsers = Array.from(userMap.values());

      return {
        users: allUsers,
        hasMore: snapshot.docs.length === (pagination?.limit || 50)
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<AdminUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      return {
        id: userDoc.id,
        email: data.email || '',
        fullName: data.fullName,
        balance: data.balance || 0,
        assets: data.assets || {},
        kycStatus: data.kycStatus,
        kycSubmissionId: data.kycSubmissionId,
        kycSubmittedAt: data.kycSubmittedAt?.toDate(),
        country: data.country,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
        lastLogin: data.lastLogin?.toDate(),
        ipAddress: data.ipAddress,
        deviceInfo: data.deviceInfo,
        isBlocked: data.isBlocked || false,
        isFlagged: data.isFlagged || false,
        numericalUid: data.numericalUid
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updates: Partial<AdminUser>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async blockUser(userId: string, isBlocked: boolean, adminId: string): Promise<void> {
    try {
      await this.updateUser(userId, { isBlocked });
      await this.logAdminAction(adminId, isBlocked ? 'block_user' : 'unblock_user', userId);
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      throw error;
    }
  }

  static async flagUser(userId: string, isFlagged: boolean, adminId: string): Promise<void> {
    try {
      await this.updateUser(userId, { isFlagged });
      await this.logAdminAction(adminId, isFlagged ? 'flag_user' : 'unflag_user', userId);
    } catch (error) {
      console.error('Error flagging/unflagging user:', error);
      throw error;
    }
  }

  static async updateUserStatus(userId: string, action: 'block' | 'unblock' | 'flag' | 'unflag'): Promise<void> {
    try {
      // Update via server endpoint that handles Firebase Auth
      const response = await fetch('/api/admin/update-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Also update Firestore if needed
      try {
        const adminId = 'admin-system'; // Replace with actual admin ID
        switch (action) {
          case 'block':
            await this.blockUser(userId, true, adminId);
            break;
          case 'unblock':
            await this.blockUser(userId, false, adminId);
            break;
          case 'flag':
            await this.flagUser(userId, true, adminId);
            break;
          case 'unflag':
            await this.flagUser(userId, false, adminId);
            break;
        }
      } catch (firestoreError) {
        console.log('Could not update Firestore, Firebase Auth updated successfully');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Messaging System
  static async sendMessage(data: {
    subject: string;
    body: string;
    recipients: string[];
    channel: 'email' | 'in-app' | 'push';
  }, adminId?: string): Promise<string> {
    try {
      const messageData = {
        ...data,
        sentAt: serverTimestamp(),
        status: 'sent',
        sentBy: adminId || 'admin-system'
      };

      const docRef = await addDoc(collection(db, 'admin_messages'), messageData);

      // Log the action
      await this.logAdminAction(adminId || 'admin-system', 'send_message', undefined, {
        messageId: docRef.id,
        recipientCount: data.recipients.length,
        channel: data.channel
      });

      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async getMessages(adminId?: string): Promise<AdminMessage[]> {
    try {
      let q = query(collection(db, 'admin_messages'), orderBy('sentAt', 'desc'));

      if (adminId) {
        q = query(q, where('sentBy', '==', adminId));
      }

      const snapshot = await getDocs(q);
      const messages: AdminMessage[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          subject: data.subject,
          body: data.body,
          recipients: data.recipients,
          channel: data.channel,
          status: data.status,
          sentAt: data.sentAt?.toDate(),
          sentBy: data.sentBy,
          readBy: data.readBy || []
        });
      });

      return messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // Analytics
  static async getAnalytics(): Promise<AdminAnalytics> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get total users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Get new users today and this week
      let newUsersToday = 0;
      let newUsersThisWeek = 0;

      usersSnapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date());
        if (createdAt) {
          if (createdAt >= today) {
            newUsersToday++;
          }
          if (createdAt >= weekAgo) {
            newUsersThisWeek++;
          }
        }
      });

      // Get KYC submissions
      const kycSnapshot = await getDocs(collection(db, 'kyc_submissions'));
      const kycSubmissions = {
        pending: 0,
        approved: 0,
        rejected: 0,
        under_review: 0
      };

      let totalProcessingTime = 0;
      let processedSubmissions = 0;
      const rejectionReasons: Record<string, number> = {};

      kycSnapshot.forEach(doc => {
        const data = doc.data();
        const status = data.status;

        if (status in kycSubmissions) {
          kycSubmissions[status as keyof typeof kycSubmissions]++;
        }

        // Calculate processing time for approved/rejected submissions
        if ((status === 'approved' || status === 'rejected') && data.submittedAt && data.reviewedAt) {
          const submittedAt = data.submittedAt.toDate();
          const reviewedAt = data.reviewedAt.toDate();
          const processingTime = reviewedAt.getTime() - submittedAt.getTime();
          totalProcessingTime += processingTime;
          processedSubmissions++;
        }

        // Track rejection reasons
        if (status === 'rejected' && data.adminComments) {
          const reason = data.adminComments.toLowerCase();
          rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
        }
      });

      const averageKycProcessingTime = processedSubmissions > 0 
        ? totalProcessingTime / processedSubmissions / (1000 * 60 * 60) // Convert to hours
        : 0;

      const topRejectionReasons = Object.entries(rejectionReasons)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([reason, count]) => ({ reason, count }));

      return {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        kycSubmissions,
        averageKycProcessingTime,
        topRejectionReasons
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  // Audit Logging
  static async logAdminAction(
    adminId: string,
    action: string,
    target?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const logData = {
        adminId,
        adminEmail: '', // Will be filled by the calling function
        action,
        target,
        details,
        timestamp: serverTimestamp(),
        ipAddress: '' // Could be filled from client context
      };

      await addDoc(collection(db, 'admin_audit_logs'), logData);
    } catch (error) {
      console.error('Error logging admin action:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  static async getAuditLogs(
    adminId?: string,
    limitCount: number = 50
  ): Promise<AdminAuditLog[]> {
    try {
      let q = query(
        collection(db, 'admin_audit_logs'),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limitCount)
      );

      if (adminId) {
        q = query(
          collection(db, 'admin_audit_logs'),
          where('adminId', '==', adminId),
          orderBy('timestamp', 'desc'),
          firestoreLimit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const logs: AdminAuditLog[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          adminId: data.adminId,
          adminEmail: data.adminEmail,
          action: data.action,
          target: data.target,
          details: data.details,
          timestamp: data.timestamp?.toDate() || new Date(),
          ipAddress: data.ipAddress
        });
      });

      return logs;
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw error;
    }
  }

  // System Operations
  static async broadcastSystemUpdate(
    message: string,
    adminId: string
  ): Promise<void> {
    try {
      const updateData = {
        message,
        createdBy: adminId,
        createdAt: serverTimestamp(),
        isActive: true
      };

      await addDoc(collection(db, 'system_updates'), updateData);
      await this.logAdminAction(adminId, 'broadcast_system_update', undefined, { message });
    } catch (error) {
      console.error('Error broadcasting system update:', error);
      throw error;
    }
  }



  // Risk and Fraud Detection
  static async detectDuplicateAccounts(): Promise<Array<{
    type: 'email' | 'document' | 'device';
    value: string;
    users: AdminUser[];
  }>> {
    try {
      const duplicates: Array<{
        type: 'email' | 'document' | 'device';
        value: string;
        users: AdminUser[];
      }> = [];

      // This is a simplified version - in production, you'd want more sophisticated detection
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const emailMap: Record<string, AdminUser[]> = {};
      const deviceMap: Record<string, AdminUser[]> = {};

      usersSnapshot.forEach(doc => {
        const data = doc.data();
        const user: AdminUser = {
          id: doc.id,
          email: data.email || '',
          fullName: data.fullName,
          balance: data.balance || 0,
          assets: data.assets || {},
          kycStatus: data.kycStatus,
          kycSubmissionId: data.kycSubmissionId,
          kycSubmittedAt: data.kycSubmittedAt?.toDate(),
          country: data.country,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
          lastLogin: data.lastLogin?.toDate(),
          ipAddress: data.ipAddress,
          deviceInfo: data.deviceInfo,
          isBlocked: data.isBlocked || false,
          isFlagged: data.isFlagged || false,
          numericalUid: data.numericalUid
        };

        // Check for duplicate emails (shouldn't happen with Firebase Auth, but check anyway)
        if (user.email) {
          if (!emailMap[user.email]) emailMap[user.email] = [];
          emailMap[user.email].push(user);
        }

        // Check for duplicate devices
        if (user.deviceInfo) {
          if (!deviceMap[user.deviceInfo]) deviceMap[user.deviceInfo] = [];
          deviceMap[user.deviceInfo].push(user);
        }
      });

      // Find duplicates
      Object.entries(emailMap).forEach(([email, users]) => {
        if (users.length > 1) {
          duplicates.push({ type: 'email', value: email, users });
        }
      });

      Object.entries(deviceMap).forEach(([device, users]) => {
        if (users.length > 1) {
          duplicates.push({ type: 'device', value: device, users });
        }
      });

      return duplicates;
    } catch (error) {
      console.error('Error detecting duplicate accounts:', error);
      throw error;
    }
  }
}