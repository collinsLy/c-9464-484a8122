
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, set, onValue, remove, query, orderByChild, equalTo, update } from 'firebase/database';
import { toast } from 'sonner';
import { getCoinPrice, getCoingeckoIdFromSymbol } from './api/coingecko';

// Play alert sound
const playAlertSound = () => {
  const audio = new Audio('/sounds/alert.mp3');
  audio.play().catch(error => console.error('Error playing sound:', error));
};

class AlertServiceClass {
  private db = getDatabase();
  
  // Create a new price alert
  async createPriceAlert(symbol: string, targetPrice: number, condition: 'above' | 'below') {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        toast.error('You must be logged in to create alerts');
        return null;
      }
      
      const alertData = {
        userId: user.uid,
        symbol,
        targetPrice,
        condition,
        createdAt: Date.now(),
        triggered: false
      };
      
      // Create reference to alerts collection under the user's ID
      const alertsRef = ref(this.db, `users/${user.uid}/alerts`);
      const newAlertRef = push(alertsRef);
      
      // Use set() with the key from push()
      await set(newAlertRef, alertData);
      
      toast.success('Price alert created successfully');
      return newAlertRef.key;
    } catch (error) {
      console.error('Error creating price alert:', error);
      toast.error('Failed to create price alert');
      return null;
    }
  }
  
  // Delete a price alert
  async deletePriceAlert(alertId: string) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        toast.error('You must be logged in to delete alerts');
        return;
      }
      
      // Reference the specific alert under the user's ID
      await remove(ref(this.db, `users/${user.uid}/alerts/${alertId}`));
      toast.success('Alert deleted successfully');
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  }
  
  // Get user's alerts
  getUserAlerts(callback: (alerts: any[]) => void) {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      callback([]);
      return () => {};
    }
    
    // Reference alerts under the user's ID
    const userAlertsRef = ref(this.db, `users/${user.uid}/alerts`);
    
    const unsubscribe = onValue(userAlertsRef, (snapshot) => {
      const alerts: any[] = [];
      snapshot.forEach((childSnapshot) => {
        alerts.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(alerts);
    });
    
    return unsubscribe;
  }
  
  // Check alerts against current prices - using real CoinGecko data
  async checkPriceAlerts(forcedCheck = false) {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return;
    
    // Reference alerts under the user's ID
    const userAlertsRef = ref(this.db, `users/${user.uid}/alerts`);
    
    onValue(userAlertsRef, async (snapshot) => {
      // Group alerts by symbol to minimize API calls
      const symbolGroups: {[key: string]: {alert: any, id: string}[]} = {};
      
      snapshot.forEach((childSnapshot) => {
        const alert = childSnapshot.val();
        const id = childSnapshot.key;
        
        if (!alert.triggered) {
          const symbol = alert.symbol;
          if (!symbolGroups[symbol]) {
            symbolGroups[symbol] = [];
          }
          symbolGroups[symbol].push({ alert, id });
        }
      });
      
      // Fetch current prices for each symbol
      for (const symbol in symbolGroups) {
        try {
          const coinId = getCoingeckoIdFromSymbol(symbol);
          const priceData = await getCoinPrice(coinId);
          
          if (!priceData || !priceData[coinId]) {
            console.error(`Failed to fetch price for ${symbol}`);
            continue;
          }
          
          const currentPrice = priceData[coinId].usd;
          
          // Check each alert for this symbol
          for (const { alert, id } of symbolGroups[symbol]) {
            const { targetPrice, condition } = alert;
            
            let isTriggered = false;
            
            if (condition === 'above' && currentPrice >= targetPrice) {
              isTriggered = true;
            } else if (condition === 'below' && currentPrice <= targetPrice) {
              isTriggered = true;
            }
            
            if (isTriggered) {
              // Update the alert to mark it as triggered
              const alertRef = ref(this.db, `users/${user.uid}/alerts/${id}`);
              await update(alertRef, { triggered: true });
              
              // Notify the user
              toast.success(
                `Alert triggered: ${symbol} is now ${condition} $${targetPrice}`,
                { duration: 6000 }
              );
              
              playAlertSound();
            }
          }
        } catch (error) {
          console.error(`Error checking alerts for ${symbol}:`, error);
        }
      }
    }, { onlyOnce: !forcedCheck }); // onlyOnce: true for manual checks
  }
}

export const AlertService = new AlertServiceClass();
