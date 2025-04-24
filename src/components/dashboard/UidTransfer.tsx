
import { useState } from "react";
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
          description: `Received from ${senderDoc.data().fullName || "User"}`
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
        description: `Successfully sent ${transferAmount} to user`,
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
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount to transfer"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/5 border-white/10"
          />
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
