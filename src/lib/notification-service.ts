import { toast } from "@/components/ui/use-toast";

// Types for notifications
export interface NotificationOptions {
  showToast?: boolean;
  playSound?: boolean;
  soundType?: 'transfer' | 'deposit' | 'success' | 'warning' | 'error' | 'payment_success' | 'alert' | 'notification' | 'withdraw';
  body?: string;
  icon?: string;
}

// Sound effects
const SOUND_EFFECTS = {
  transfer: new Audio('/sounds/transfer.mp3'),
  deposit: new Audio('/sounds/deposit.mp3'),
  success: new Audio('/sounds/success.mp3'),
  warning: new Audio('/sounds/warning.mp3'),
  error: new Audio('/sounds/error.mp3'),
  payment_success: new Audio('/sounds/payment_success.mp3'),
  alert: new Audio('/sounds/alert.mp3'),
  notification: new Audio('/sounds/alert.mp3'),
  withdraw: new Audio('/sounds/warning.mp3'),
};

// Preload sounds
Object.values(SOUND_EFFECTS).forEach(audio => {
  audio.load();
  audio.volume = 0.5; // Set default volume
});

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
      // Play payment success sound
      this.playSound('payment_success');

      // Show toast notification
      toast({
        title: "Withdrawal Processing",
        description: `Your withdrawal has been submitted and is being processed`,
        variant: "success",
        className: "notification-toast",
      });

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        const cryptoAmount = transaction.cryptoAmount || null;
        const cryptoType = transaction.crypto || null;

        if (cryptoAmount && cryptoType) {
          new Notification('Withdrawal Processing', {
            body: `Your withdrawal of ${cryptoAmount} ${cryptoType} is being processed`,
            icon: '/favicon.svg'
          });
        } else {
          new Notification('Withdrawal Processing', {
            body: `Your withdrawal is being processed`,
            icon: '/favicon.svg'
          });
        }
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
    options: NotificationOptions = { showToast: true, playSound: true, soundType: 'payment_success' }
  ) {
    // Show toast notification
    if (options.showToast) {
      toast({
        title: `Received ${amount} ${currency}`,
        description: `${senderName} sent you ${amount} ${currency}`,
        variant: "success",
        className: "notification-toast",
      });
    }

    // Play sound notification
    if (options.playSound && options.soundType) {
      this.playSound(options.soundType);
    }

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('Funds Received', {
        body: `${senderName} sent you ${amount} ${currency}`,
        icon: '/favicon.svg'
      });
    }
  }

  // Play a sound effect
  static playSound(type: keyof typeof SOUND_EFFECTS): void {
    try {
      // Stop and reset any currently playing sounds
      Object.values(SOUND_EFFECTS).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });

      const sound = SOUND_EFFECTS[type];
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => {
          console.error('Error playing notification sound:', error);
        });
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  // Set volume for all sounds
  static setVolume(volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    Object.values(SOUND_EFFECTS).forEach(audio => {
      audio.volume = normalizedVolume;
    });
  }

  // Test all sound effects (for development)
  static testSounds(): void {
    console.log('Testing notification sounds...');
    const soundTypes: (keyof typeof SOUND_EFFECTS)[] = ['transfer', 'deposit', 'success', 'warning', 'error'];

    let index = 0;
    const playNext = () => {
      if (index < soundTypes.length) {
        const soundType = soundTypes[index];
        console.log(`Playing ${soundType} sound...`);
        this.playSound(soundType);
        index++;
        setTimeout(playNext, 1500); // Play each sound with 1.5 second delay
      }
    };

    playNext();
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