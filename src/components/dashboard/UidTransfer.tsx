import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { UserService } from "@/lib/user-service";
import { doc, runTransaction } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface UidTransferProps {
  currentBalance: number;
  onTransferComplete?: () => void;
}

const UidTransfer = ({ currentBalance, onTransferComplete }: UidTransferProps) => {
  const [recipientUid, setRecipientUid] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const currentUserId = auth.currentUser?.uid || null;
  const [selectedCrypto, setSelectedCrypto] = useState("USDT");
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [userAssets, setUserAssets] = useState<Record<string, any>>({});

  // Fetch current prices for all assets
  useEffect(() => {
    const fetchPrices = async () => {
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

  // Fetch user's assets
  useEffect(() => {
    const fetchUserAssets = async () => {
      if (!currentUserId) return;

      try {
        const userData = await UserService.getUserData(currentUserId);
        if (userData && userData.assets) {
          setUserAssets(userData.assets);
        }
      } catch (error) {
        console.error('Error fetching user assets:', error);
      }
    };

    fetchUserAssets();
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

    if (recipientUid === currentUserId) {
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

    if (transferAmount > currentBalance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough funds for this transfer",
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

      // Check if recipient exists
      const recipientData = await UserService.getUserData(recipientUid);

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
      const recipientRef = doc(db, 'users', recipientUid);

      // Use a transaction to ensure atomic updates
      await runTransaction(db, async (transaction) => {
        // Get current data
        const senderDoc = await transaction.get(senderRef);
        const recipientDoc = await transaction.get(recipientRef);

        if (!senderDoc.exists() || !recipientDoc.exists()) {
          throw new Error("User document not found");
        }

        // Get current balances
        const senderBalance = senderDoc.data().balance || 0;
        const recipientBalance = recipientDoc.data().balance || 0;

        // Verify sender has enough funds (double-check)
        if (senderBalance < transferAmount) {
          throw new Error("Insufficient funds");
        }

        // Update balances
        transaction.update(senderRef, { 
          balance: senderBalance - transferAmount 
        });

        transaction.update(recipientRef, { 
          balance: recipientBalance + transferAmount 
        });

        // Add transaction record to both users
        const transactionRecord = {
          type: "transfer",
          amount: transferAmount,
          timestamp: new Date().toISOString(),
          status: "completed"
        };

        // Add to sender's transactions
        const senderTransaction = {
          ...transactionRecord,
          direction: "out",
          recipientId: recipientUid,
          recipientName: recipientDoc.data().fullName || "User",
          description: `Sent to ${recipientDoc.data().fullName || "User"}`
        };

        // Add to recipient's transactions
        const recipientTransaction = {
          ...transactionRecord,
          direction: "in",
          senderId: currentUserId,
          senderName: senderDoc.data().fullName || "User",
          description: `Received from ${senderDoc.data().fullName || "User"}`,
          asset: selectedCrypto  // Store the cryptocurrency type
        };

        // Update transactions arrays
        const senderTransactions = senderDoc.data().transactions || [];
        const recipientTransactions = recipientDoc.data().transactions || [];

        transaction.update(senderRef, { 
          transactions: [senderTransaction, ...senderTransactions] 
        });

        transaction.update(recipientRef, { 
          transactions: [recipientTransaction, ...recipientTransactions] 
        });
      });

      // Show success message
      toast({
        title: "Transfer Successful",
        description: `Successfully sent ${transferAmount} ${selectedCrypto} to user`,
        className: "transaction-complete-toast"
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
          <Label htmlFor="recipientUid">Recipient UID</Label>
          <Input
            id="recipientUid"
            placeholder="Enter recipient's UID"
            value={recipientUid}
            onChange={(e) => setRecipientUid(e.target.value)}
            className="bg-white/5 border-white/10"
          />
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
                          ? "https://cryptologos.cc/logos/worldcoin-org-wld-logo.svg?v=040" 
                          : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`}
                        alt={crypto.symbol}
                        className="w-full h-full"
                        onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://cryptologos.cc/logos/worldcoin-org-wld-logo.svg?v=040";
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
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to transfer"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/5 border-white/10 pr-16"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-white/70">{selectedCrypto}</span>
            </div>
          </div>
          {amount && (
            <div className="flex justify-between text-sm text-white/70">
              <span>Value:</span>
              <span>≈ ${calculateUsdValue().toFixed(2)} USD</span>
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

        <div className="bg-white/5 p-3 rounded-md mt-4 text-sm">
          <p className="font-medium mb-2">Your UID: {currentUserId}</p>
          <p>Share this UID with others who want to send you funds.</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(currentUserId || "");
              toast({
                title: "Copied!",
                description: "Your UID has been copied to clipboard",
              });
            }}
          >
            Copy UID
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UidTransfer;