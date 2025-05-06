
import { toast } from '@/hooks/use-toast';

// Store audio instances to avoid recreating them
const audioInstances: Record<string, HTMLAudioElement> = {};

// Sound types
export type NotificationSoundType = 'funds-received' | 'transaction-complete' | 'alert';

// Function to play notification sounds
export const playNotificationSound = (soundType: NotificationSoundType = 'funds-received') => {
  // Map sound types to audio files
  const soundMap: Record<NotificationSoundType, string> = {
    'funds-received': 'https://assets.mixkit.co/active_storage/sfx/2275/2275-preview.mp3',
    'transaction-complete': 'https://assets.mixkit.co/active_storage/sfx/888/888-preview.mp3',
    'alert': 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'
  };
  
  // Get the URL for the requested sound
  const soundUrl = soundMap[soundType];
  
  // Create or reuse audio element
  if (!audioInstances[soundType]) {
    audioInstances[soundType] = new Audio(soundUrl);
  }
  
  // Play the sound
  const audioElement = audioInstances[soundType];
  audioElement.currentTime = 0;
  
  // Handle browser autoplay restrictions by checking if user has interacted with the page
  const playPromise = audioElement.play();
  
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.log('Audio playback was prevented:', error);
    });
  }
};

// Function to show a funds received notification
export const showFundsReceivedNotification = (
  amount: number | string,
  currency: string,
  sender?: string,
  playSound: boolean = true
) => {
  // Format amount properly
  const formattedAmount = typeof amount === 'number' 
    ? amount.toFixed(4) 
    : amount;
  
  // Create notification content
  const title = "Funds Received";
  const description = sender 
    ? `You've received ${formattedAmount} ${currency} from ${sender}`
    : `You've received ${formattedAmount} ${currency}`;
  
  // Show toast notification
  toast({
    title,
    description,
    className: "funds-received-toast",
    duration: 6000, // Show for 6 seconds
  });
  
  // Play notification sound if enabled
  if (playSound) {
    playNotificationSound('funds-received');
  }
};

// Function to show a transaction completed notification
export const showTransactionCompletedNotification = (
  message: string,
  playSound: boolean = true
) => {
  toast({
    title: "Transaction Complete",
    description: message,
    className: "transaction-complete-toast",
    duration: 5000,
  });
  
  if (playSound) {
    playNotificationSound('transaction-complete');
  }
};
