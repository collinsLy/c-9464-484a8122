
import { toast } from "@/components/ui/use-toast";

// Types for notifications
export interface NotificationOptions {
  showToast?: boolean;
  playSound?: boolean;
  soundType?: 'transfer' | 'deposit' | 'success' | 'warning' | 'error';
}

// Sound effects
const SOUND_EFFECTS = {
  transfer: new Audio('/sounds/transfer.mp3'),
  deposit: new Audio('/sounds/deposit.mp3'),
  success: new Audio('/sounds/success.mp3'),
  warning: new Audio('/sounds/warning.mp3'),
  error: new Audio('/sounds/error.mp3'),
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

  // Show a notification for fund transfer
  static notifyFundReceived(
    amount: number,
    currency: string, 
    senderName: string, 
    options: NotificationOptions = { showToast: true, playSound: true, soundType: 'transfer' }
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
}
