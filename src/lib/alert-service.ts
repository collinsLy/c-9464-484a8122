
import { db } from './firebase';
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { UserService } from './user-service';
import { toast } from 'sonner';

export type AlertCondition = 'above' | 'below';

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  price: number;
  condition: AlertCondition;
  createdAt: Date;
  triggered?: boolean;
}

export class AlertService {
  // Check current price against alerts
  static async checkPriceAlerts(currentPrices: Record<string, number>) {
    const userId = UserService.getCurrentUserId();
    if (!userId) return;
    
    try {
      // Get all non-triggered alerts for the current user
      const alertsRef = collection(db, 'price_alerts');
      const q = query(
        alertsRef, 
        where('userId', '==', userId),
        where('triggered', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as PriceAlert[];
      
      // Check each alert against current prices
      for (const alert of alerts) {
        const symbolKey = `${alert.symbol}USD`;
        const currentPrice = currentPrices[symbolKey];
        
        if (!currentPrice) continue;
        
        let isTriggered = false;
        
        if (alert.condition === 'above' && currentPrice > alert.price) {
          isTriggered = true;
        } else if (alert.condition === 'below' && currentPrice < alert.price) {
          isTriggered = true;
        }
        
        if (isTriggered) {
          // Notify user
          toast({
            title: "Price Alert Triggered!",
            description: `${alert.symbol} is now ${alert.condition === 'above' ? 'above' : 'below'} $${alert.price}`,
          });
          
          // Mark alert as triggered
          await updateDoc(doc(db, 'price_alerts', alert.id), {
            triggered: true
          });
          
          // Play notification sound
          const audio = new Audio('/sounds/alert.mp3');
          audio.play().catch(e => console.error('Could not play alert sound', e));
        }
      }
    } catch (error) {
      console.error('Error checking price alerts:', error);
    }
  }
  
  // Reset a triggered alert
  static async resetAlert(alertId: string) {
    const userId = UserService.getCurrentUserId();
    if (!userId) return false;
    
    try {
      await updateDoc(doc(db, 'price_alerts', alertId), {
        triggered: false
      });
      return true;
    } catch (error) {
      console.error('Error resetting alert:', error);
      return false;
    }
  }
  
  // Delete an alert
  static async deleteAlert(alertId: string) {
    const userId = UserService.getCurrentUserId();
    if (!userId) return false;
    
    try {
      await deleteDoc(doc(db, 'price_alerts', alertId));
      return true;
    } catch (error) {
      console.error('Error deleting alert:', error);
      return false;
    }
  }
}
