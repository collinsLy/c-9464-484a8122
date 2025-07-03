import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { UserService } from "@/lib/user-service";
import { doc, runTransaction, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { NotificationService } from "@/lib/notification-service";
import { NumericalUidService } from "@/lib/numerical-uid-service";
import { cn } from "@/lib/utils";

interface UidTransferProps {
  currentBalance: number;
  onTransferComplete?: () => void;
}

const UidTransfer = ({ currentBalance, onTransferComplete }: UidTransferProps) => {
  const [recipientUid, setRecipientUid] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingUid, setIsValidatingUid] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<any>(null);
  const [currentUserNumericalUid, setCurrentUserNumericalUid] = useState<number | null>(null);
  const currentUserId = auth.currentUser?.uid || null;
  const [selectedCrypto, setSelectedCrypto] = useState("USDT");
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [userAssets, setUserAssets] = useState<Record<string, any>>({});

  // Fetch current user's numerical UID
  useEffect(() => {
    const fetchCurrentUserNumericalUid = async () => {
      if (currentUserId) {
        try {
          const numericalUid = await NumericalUidService.getNumericalUid(currentUserId);
          setCurrentUserNumericalUid(numericalUid);
        } catch (error) {
          console.error('Error fetching numerical UID:', error);
        }
      }
    };

    fetchCurrentUserNumericalUid();
  }, [currentUserId]);

  // Fetch current prices for all assets
  useEffect(() => {
    const fetchPrices = async () => {


  // Validate recipient UID function
  const validateRecipientUid = async () => {
    if (!recipientUid.trim()) return;

    setIsValidatingUid(true);
    try {
      const numericalUid = parseInt(recipientUid.trim());
      
      if (isNaN(numericalUid)) {
        toast({
          title: "Invalid UID",
          description: "Please enter a valid numerical UID",
          variant: "destructive"
        });
        setRecipientInfo(null);
        return;
      }

      const userData = await NumericalUidService.getUserDataByNumericalUid(numericalUid);
      
      if (userData) {
        setRecipientInfo({
          numericalUid,
          fullName: userData.fullName || 'Unknown User',
          email: userData.email
        });
        toast({
          title: "User Found",
          description: `Recipient: ${userData.fullName || 'Unknown User'}`,
        });
      } else {
        setRecipientInfo(null);
        toast({
          title: "User Not Found",
          description: "No user found with this UID",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error validating UID:', error);
      setRecipientInfo(null);
      toast({
        title: "Validation Error",
        description: "Failed to validate UID",
        variant: "destructive"
      });
    } finally {
      setIsValidatingUid(false);
    }
  };

  const handleTransfer = async () => {
    if (!currentUserId || !recipientUid.trim() || !amount.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (transferAmount > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this transfer",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const numericalUid = parseInt(recipientUid.trim());
      await UserService.transferFunds(currentUserId, numericalUid, transferAmount);
      
      toast({
        title: "Transfer Successful",
        description: `Successfully transferred $${transferAmount} to UID ${numericalUid}`,
      });
      
      setRecipientUid("");
      setAmount("");
      setRecipientInfo(null);
      if (onTransferComplete) {
        onTransferComplete();
      }
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Failed to transfer funds",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

      try {
        const symbols = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOGE', 'XRP', 'DOT', 'LINK', 'MATIC'];
        const symbolsQuery = symbols.map(s => `${s}USDT`);
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
        const data = await response.json();

        const prices: Record<string, number> = {};
        data.forEach((item: any) => {
          const symbol = item.symbol.replace('USDT', '');
          prices[symbol] = parseFloat(item.price);
        });
        // Add USDT and USDC with value of 1
        prices['USDT'] = 1;
        prices['USDC'] = 1;

        console.log("Fetched crypto prices:", prices);
        setAssetPrices(prices);
      } catch (error) {
        console.error('Error fetching asset prices:', error);
      }
    };

    fetchPrices();
    // Update prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user's assets and balances
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchUserAssets = async () => {
      if (!currentUserId) return;

      try {
        const userData = await UserService.getUserData(currentUserId);
        if (userData) {
          setUserAssets(userData.assets || {});

          // Set up balances including USDT from main balance field
          const balances: Record<string, number> = {};

          // Handle USDT specially - check both locations and prioritize the correct one
          let usdtBalance = 0;

          // First check assets.USDT (new location)
          if (userData.assets && userData.assets.USDT && userData.assets.USDT.amount !== undefined) {
            usdtBalance = Number(userData.assets.USDT.amount);
            console.log(`USDT from assets: ${usdtBalance}`);
          } else if (typeof userData.balance === 'number') {
            // Fallback to main balance field (legacy location)
            usdtBalance = userData.balance;
            console.log(`USDT from main balance field: ${usdtBalance}`);
          } else if (typeof userData.balance === 'string') {
            usdtBalance = parseFloat(userData.balance) || 0;
            console.log(`USDT from main balance field (string): ${usdtBalance}`);
          }

          balances.USDT = usdtBalance;

          // Handle other assets
          if (userData.assets) {
            Object.entries(userData.assets).forEach(([key, asset]: [string, any]) => {
              if (key !== 'USDT' && asset && typeof asset.amount !== 'undefined') {
                balances[key] = Number(asset.amount) || 0;
              }
            });
          }

          console.log('Updated user balances:', balances);
          setUserBalances(balances);
        }
      } catch (error) {
        console.error('Error fetching user assets:', error);
      }
    };

    fetchUserAssets();

    // Set up real-time listener for balance updates
    if (currentUserId) {
      const unsubscribe = UserService.subscribeToUserData(currentUserId, (userData) => {
        if (!userData) return;

        const balances: Record<string, number> = {};

        // Handle USDT specially - prioritize assets if it has a positive value, otherwise use main balance
        let usdtBalance = 0;
        if (userData.assets && userData.assets.USDT && userData.assets.USDT.amount !== undefined && userData.assets.USDT.amount > 0) {
          usdtBalance = Number(userData.assets.USDT.amount);
        } else if (typeof userData.balance === 'number') {
          usdtBalance = userData.balance;
        } else if (typeof userData.balance === 'string') {
          usdtBalance = parseFloat(userData.balance) || 0;
        }
        balances.USDT = usdtBalance;

        // Handle other assets
        if (userData.assets) {
          Object.entries(userData.assets).forEach(([key, asset]: [string, any]) => {
            if (key !== 'USDT' && asset && typeof asset.amount !== 'undefined') {
              balances[key] = Number(asset.amount) || 0;
            }
          });
        }

        setUserBalances(balances);
        setUserAssets(userData.assets || {});
      });

      return () => unsubscribe();
    }
  }, [currentUserId]);

  // Calculate USD value based on current price
  const calculateUsdValue = (): number => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) return 0;

    // Make sure we have the price data
    let price = assetPrices[selectedCrypto];

    // If price is not found in the regular map, try special cases
    if (price === undefined) {
      // Add special handling for cryptocurrencies not covered in the main fetch
      if (selectedCrypto === 'DOGE') {
        // Look for DOGE specifically in assetPrices
        price = assetPrices['DOGE'];
        console.log(`Using special case for DOGE, price: ${price}`);
      }

      // If still undefined after special handling
      if (price === undefined) {
        console.warn(`Price not found for ${selectedCrypto}. Available prices:`, assetPrices);
        return 0;
      }
    }

    const convertedValue = amountValue * price;
    console.log(`Converting ${amountValue} ${selectedCrypto} at rate ${price} = $${convertedValue.toFixed(2)} USD`);
    return convertedValue;
  };

  // Validate the transfer details
  const validateTransfer = (): boolean => {
    const transferAmount = parseFloat(amount);

    if (!recipientUid.trim()) {
      toast({
        title: "Missing Recipient",
        description: "Please enter a recipient UID",
        variant: "destructive"
      });
      return false;
    }

    // Check if trying to send to self using numerical UID
    const recipientNumericalUid = parseInt(recipientUid.trim());
    if (!isNaN(recipientNumericalUid) && recipientNumericalUid === currentUserNumericalUid) {
      toast({
        title: "Invalid Transfer",
        description: "You cannot send funds to yourself",
        variant: "destructive"
      });
      return false;
    }

    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive"
      });
      return false;
    }

    // Check balance for selected crypto
    const availableBalance = userBalances[selectedCrypto] || 0;
    console.log(`Validating transfer: ${transferAmount} ${selectedCrypto}, Available: ${availableBalance}`);

    if (transferAmount > availableBalance) {
      toast({
        title: "Insufficient Funds",
        description: `You don't have enough ${selectedCrypto} for this transfer. Available: ${availableBalance.toFixed(8)} ${selectedCrypto}`,
        variant: "destructive"
      });
      return false;
    }

    // Minimum transfer amount check
    const minTransfer = selectedCrypto === 'USDT' ? 1 : 0.001;
    if (transferAmount < minTransfer) {
      toast({
        title: "Amount Too Small",
        description: `Minimum transfer amount is ${minTransfer} ${selectedCrypto}`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  // Handle transfer of funds between users
  const handleTransfer = async () => {
    if (!validateTransfer()) return;

    setIsLoading(true);

    try {
      // Convert amount to number
      const transferAmount = parseFloat(amount);
      const numericalUid = parseInt(recipientUid.trim());

      // Convert numerical UID to Firebase UID
      const recipientFirebaseUid = await NumericalUidService.getFirebaseUidFromNumerical(numericalUid);

      if (!recipientFirebaseUid) {
        toast({
          title: "User Not Found",
          description: "No user exists with the provided UID",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Check if recipient exists
      const recipientData = await UserService.getUserData(recipientFirebaseUid);

      if (!recipientData) {
        toast({
          title: "User Not Found",
          description: "No user exists with the provided UID",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Get references to both user documents
      const senderRef = doc(db, 'users', currentUserId!);
      const recipientRef = doc(db, 'users', recipientFirebaseUid);

      // Use a transaction to ensure atomic updates
      await runTransaction(db, async (transaction) => {
        // Get current data
        const senderDoc = await transaction.get(senderRef);
        const recipientDoc = await transaction.get(recipientRef);

        if (!senderDoc.exists() || !recipientDoc.exists()) {
          throw new Error("User document not found");
        }

        const senderData = senderDoc.data();
        const recipientData = recipientDoc.data();
        const senderAssets = senderData.assets || {};
        const recipientAssets = recipientData.assets || {};

        // Handle USDT transfers specially
        if (selectedCrypto === 'USDT') {
          // Get current USDT balance (check both locations with proper priority)
          let senderUsdtBalance = 0;

          // First check assets.USDT (new location)
          if (senderAssets.USDT && senderAssets.USDT.amount !== undefined) {
            senderUsdtBalance = Number(senderAssets.USDT.amount);
            console.log(`Sender USDT from assets: ${senderUsdtBalance}`);
          } else if (typeof senderData.balance === 'number') {
            // Fallback to main balance field (legacy location)
            senderUsdtBalance = senderData.balance;
            console.log(`Sender USDT from main balance: ${senderUsdtBalance}`);
          } else if (typeof senderData.balance === 'string') {
            senderUsdtBalance = parseFloat(senderData.balance) || 0;
            console.log(`Sender USDT from main balance (string): ${senderUsdtBalance}`);
          }

          // Verify sender has enough USDT
          if (senderUsdtBalance < transferAmount) {
            throw new Error(`Insufficient USDT balance. Available: ${senderUsdtBalance}, Required: ${transferAmount}`);
          }

          // Get recipient USDT balance
          let recipientUsdtBalance = 0;
          if (recipientAssets.USDT && recipientAssets.USDT.amount !== undefined) {
            recipientUsdtBalance = Number(recipientAssets.USDT.amount);
          } else if (typeof recipientData.balance === 'number') {
            recipientUsdtBalance = recipientData.balance;
          } else if (typeof recipientData.balance === 'string') {
            recipientUsdtBalance = parseFloat(recipientData.balance) || 0;
          }

          // Calculate new balances
          const newSenderUsdtBalance = senderUsdtBalance - transferAmount;
          const newRecipientUsdtBalance = recipientUsdtBalance + transferAmount;

          // Update sender's assets and clear legacy balance
          const updatedSenderAssets = { ...senderAssets };
          updatedSenderAssets.USDT = {
            amount: newSenderUsdtBalance,
            name: 'USDT'
          };

          // Update recipient's assets and clear legacy balance
          const updatedRecipientAssets = { ...recipientAssets };
          updatedRecipientAssets.USDT = {
            amount: newRecipientUsdtBalance,
            name: 'USDT'
          };

          console.log(`Updating sender USDT: ${senderUsdtBalance} -> ${newSenderUsdtBalance}`);
          console.log(`Updating recipient USDT: ${recipientUsdtBalance} -> ${newRecipientUsdtBalance}`);

          transaction.update(senderRef, { 
            assets: updatedSenderAssets,
            balance: 0 // Clear legacy balance field
          });

          transaction.update(recipientRef, { 
            assets: updatedRecipientAssets,
            balance: 0 // Clear legacy balance field
          });
        } else {
          // Handle other crypto transfers
          const senderCryptoBalance = Number(senderAssets[selectedCrypto]?.amount) || 0;
          const recipientCryptoBalance = Number(recipientAssets[selectedCrypto]?.amount) || 0;

          // Verify sender has enough of the selected crypto
          if (senderCryptoBalance < transferAmount) {
            throw new Error(`Insufficient ${selectedCrypto} balance`);
          }

          // Update sender assets
          const updatedSenderAssets = { ...senderAssets };
          updatedSenderAssets[selectedCrypto] = {
            ...updatedSenderAssets[selectedCrypto],
            amount: senderCryptoBalance - transferAmount
          };

          // Update recipient assets
          const updatedRecipientAssets = { ...recipientAssets };
          if (!updatedRecipientAssets[selectedCrypto]) {
            updatedRecipientAssets[selectedCrypto] = {
              amount: transferAmount,
              name: selectedCrypto
            };
          } else {
            updatedRecipientAssets[selectedCrypto] = {
              ...updatedRecipientAssets[selectedCrypto],
              amount: recipientCryptoBalance + transferAmount
            };
          }

          transaction.update(senderRef, { 
            assets: updatedSenderAssets
          });

          transaction.update(recipientRef, { 
            assets: updatedRecipientAssets
          });
        }

        // Add transaction record to both users
        const usdValue = transferAmount * (assetPrices[selectedCrypto] || 1);
        const transactionRecord = {
          type: "Transfer",
          method: "vertex",
          crypto: selectedCrypto,
          amount: usdValue,
          cryptoAmount: transferAmount,
          timestamp: new Date().toISOString(),
          status: "Completed",
          txId: `TX${Date.now()}`
        };

        // Add to sender's transactions
        const senderTransaction = {
          ...transactionRecord,
          direction: "out",
          recipientId: recipientUid,
          recipientName: recipientData.fullName || "User",
          details: {
            crypto: selectedCrypto,
            amount: transferAmount,
            recipientId: recipientUid,
            recipientName: recipientData.fullName || "User",
            transferType: 'internal'
          }
        };

        // Add to recipient's transactions
        const recipientTransaction = {
          ...transactionRecord,
          direction: "in",
          senderId: currentUserId,
          senderName: senderData.fullName || "User",
          details: {
            crypto: selectedCrypto,
            amount: transferAmount,
            senderId: currentUserId,
            senderName: senderData.fullName || "User",
            transferType: 'internal'
          },
          isRead: false, // Flag to track if the notification has been seen
          notificationId: `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Unique notification ID
        };

        // Update transactions arrays
        const senderTransactions = senderDoc.data().transactions || [];
        const recipientTransactions = recipientDoc.data().transactions || [];

        transaction.update(senderRef, { 
          transactions: [senderTransaction, ...senderTransactions] 
        });

        transaction.update(recipientRef, { 
          transactions: [recipientTransaction, ...recipientTransactions],
          hasUnreadNotifications: true // Set flag that recipient has unread notifications
        });

        // Store a notification in the notifications collection for the recipient
        // This will be used to trigger real-time notifications
        const notificationData = {
          userId: recipientUid,
          type: "transfer",
          asset: selectedCrypto,
          amount: transferAmount,
          senderId: currentUserId,
          senderName: senderDoc.data().fullName || "User",
          timestamp: new Date().toISOString(),
          isRead: false,
          notificationId: recipientTransaction.notificationId
        };

        // This will be added outside the transaction to avoid making the transaction too complex
      });

      // Add notification document (outside the transaction)
      try {
        const notificationRef = doc(db, 'notifications', `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        await setDoc(notificationRef, {
          userId: recipientUid,
          type: "transfer",
          asset: selectedCrypto,
          amount: transferAmount,
          senderId: currentUserId,
          senderName: auth.currentUser?.displayName || "User",
          timestamp: new Date().toISOString(),
          isRead: false
        });

        console.log("Notification created for recipient");
      } catch (error) {
        console.error("Error creating notification:", error);
      }

      // Send email notification to both sender and receiver
      try {
        const { auth } = await import('@/lib/firebase');
        const currentUser = auth.currentUser;
        
        // Send email to sender
        if (currentUser?.email) {
          console.log('Sending transfer email to sender:', currentUser.email);
          const senderEmailResponse = await fetch('/api/send-transaction-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: currentUser.email,
              username: currentUser.displayName || 'User',
              type: 'transfer',
              amount: transferAmount * (assetPrices[selectedCrypto] || 1),
              receiver: recipientData.fullName || recipientData.email || 'User'
            }),
          });

          if (senderEmailResponse.ok) {
            console.log('Transfer email sent successfully to sender');
          } else {
            console.error('Failed to send transfer email to sender');
          }
        }

        // Send email to receiver if they have an email
        if (recipientData.email) {
          console.log('Sending transfer email to receiver:', recipientData.email);
          const receiverEmailResponse = await fetch('/api/send-transaction-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: recipientData.email,
              username: recipientData.fullName || 'User',
              type: 'transfer',
              amount: transferAmount * (assetPrices[selectedCrypto] || 1),
              receiver: currentUser?.displayName || currentUser?.email || 'User'
            }),
          });

          if (receiverEmailResponse.ok) {
            console.log('Transfer email sent successfully to receiver');
          } else {
            console.error('Failed to send transfer email to receiver');
          }
        }
      } catch (error) {
        console.error('Error sending transfer emails:', error);
      }

      // Show success message
      toast({
        title: "Transfer Successful",
        description: `Successfully sent ${transferAmount} ${selectedCrypto} to user`,
      });

      // Reset form
      setRecipientUid("");
      setAmount("");

      // Call the completion handler
      if (onTransferComplete) {
        onTransferComplete();
      }
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast({
        title: "Transfer Failed",
        description: error.message || "An error occurred during transfer",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-5 w-5"
          >
            <path d="M17 6h-5a2 2 0 0 0-2 2v10m0 0H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3m8 10V4a2 2 0 0 0-2-2h-3m5.42 12L16 16.5l-1.42-1.42M12 16H6m0-4h2" />
          </svg>
          Send Funds via UID
        </CardTitle>
        <CardDescription>
          Send funds directly to another user using their UID
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipientUid">Recipient UID (Numerical)</Label>
          <Input
            id="recipientUid"
            placeholder="Enter recipient's numerical UID (e.g., 123456789)"
            value={recipientUid}
            onChange={(e) => {
              setRecipientUid(e.target.value);
              setRecipientInfo(null); // Clear recipient info when input changes
            }}
            className="bg-white/5 border-white/10"
            type="number"
          />
          {recipientUid && (
            <div className="flex items-center mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={validateRecipientUid}
                disabled={isValidatingUid}
                className="text-xs"
              >
                {isValidatingUid ? 
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validating...
                  </div> : 
                  'Validate UID'
                }
              </Button>
            </div>
          )}
          {recipientInfo && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-md p-2 mt-2">
              <p className="text-sm text-green-400">✓ Recipient found: {recipientInfo.fullName}</p>
              <p className="text-xs text-white/60">{recipientInfo.email}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Select Cryptocurrency</Label>
          <div className="grid grid-cols-3 gap-3 mb-2"> {/* Display only important coins in first row */}
            {[
              { symbol: 'BTC', name: 'Bitcoin', chainColor: '#F7931A' },
              { symbol: 'ETH', name: 'Ethereum', chainColor: '#627EEA' },
              { symbol: 'USDT', name: 'Tether', chainColor: '#26A17B' },
            ].map((crypto) => {
              const balance = userBalances?.[crypto.symbol] || 0;
              const hasBalance = balance > 0;

              return (
                <div
                  key={crypto.symbol}
                  className={cn(
                    "relative group cursor-pointer",
                    !hasBalance && "opacity-70"
                  )}
                  onClick={() => setSelectedCrypto(crypto.symbol)}
                >
                  <div
                    className={cn(
                      "rounded-xl p-3 backdrop-blur-md transition-all duration-300",
                      "border bg-black/20",
                      selectedCrypto === crypto.symbol 
                        ? "border-[#F2FF44]" 
                        : "border-white/10 hover:border-white/20",
                      "flex flex-col items-center justify-center gap-2"
                    )}
                  >
                    <div className="relative w-6 h-6">
                      <img
                        src={crypto.symbol === 'WLD' 
                          ? "/favicon.svg" 
                          : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`}
                        alt={crypto.symbol}
                        className="w-full h-full"
                        onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Worldcoin_Logo.png/960px-Worldcoin_Logo.png?20230810200406";
                        }}
                      />
                      {selectedCrypto === crypto.symbol && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F2FF44] rounded-full">
                          <svg 
                            viewBox="0 0 24 24" 
                            className="w-full h-full text-black"
                          >
                            <path 
                              fill="currentColor" 
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="font-semibold text-white text-xs">
                        {crypto.symbol}
                      </div>
                      {hasBalance && (
                        <div className="text-xs text-white/70">
                          {balance.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs mb-2"
            onClick={() => {
              toast({
                title: "All Cryptocurrencies",
                description: "This would open a dialog with all cryptocurrencies",
              });
            }}
          >
            See All Cryptocurrencies
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="amount">Amount</Label>
            <span className="text-sm text-white/70">
              Available: {(userBalances[selectedCrypto] || 0).toFixed(8)} {selectedCrypto}
            </span>
          </div>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to transfer"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/5 border-white/10 pr-16"
              step={selectedCrypto === 'USDT' ? '0.01' : '0.00000001'}
              min="0"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-white/70">{selectedCrypto}</span>
            </div>
          </div>
          {amount && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-white/70">
                <span>Value:</span>
                <span>≈ ${calculateUsdValue().toFixed(2)} USD</span>
              </div>
              {parseFloat(amount) > (userBalances[selectedCrypto] || 0) && (
                <p className="text-xs text-red-400">
                  ⚠️ Insufficient balance. You have {(userBalances[selectedCrypto] || 0).toFixed(8)} {selectedCrypto}
                </p>
              )}
            </div>
          )}
        </div>

        <Button 
          className="w-full mt-4 bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]" 
          onClick={handleTransfer}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Transfer Funds"}
        </Button>

        
      </CardContent>
    </Card>
  );
};

export default UidTransfer;