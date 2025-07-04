
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, set, onValue, remove, query, orderByChild, equalTo, update } from 'firebase/database';
import { toast } from 'sonner';
import { getCoinPrice, getCoingeckoIdFromSymbol } from './api/coingecko';

// Alert sound functionality removed

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
      
      // Batch API calls to reduce chances of rate limiting
      const symbolEntries = Object.entries(symbolGroups);
      const batchSize = 2; // Process 2 symbols at a time
      
      for (let i = 0; i < symbolEntries.length; i += batchSize) {
        const batch = symbolEntries.slice(i, i + batchSize);
        
        // Process each batch with a delay between batches
        await Promise.all(batch.map(async ([symbol, alerts]) => {
          try {
            const coinId = getCoingeckoIdFromSymbol(symbol);
            const priceData = await getCoinPrice(coinId);
            
            if (!priceData || !priceData[coinId]) {
              console.warn(`No price data available for ${symbol}`);
              return;
            }
            
            const currentPrice = priceData[coinId].usd;
            
            // Check each alert for this symbol
            for (const { alert, id } of alerts) {
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
              }
            }
          } catch (error) {
            console.error(`Error checking alerts for ${symbol}:`, error);
          }
        }));
        
        // Add delay between batches to avoid rate limiting
        if (i + batchSize < symbolEntries.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }, { onlyOnce: !forcedCheck }); // onlyOnce: true for manual checks
  }
}

export const AlertService = new AlertServiceClass();
