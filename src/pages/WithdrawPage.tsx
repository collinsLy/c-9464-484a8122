
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Check } from 'lucide-react';
import { UserBalanceService } from '@/lib/firebase-service';
import { UserService } from '@/lib/user-service';
import firebase from 'firebase/app';
import { useDashboardContext } from '@/components/dashboard/DashboardLayout';
import { useToast } from "@/components/ui/use-toast";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BankIcon, PayPalIcon, MpesaIcon, AirtelMoneyIcon } from '@/assets/payment-icons';
import { cn } from '@/lib/utils';

const WithdrawPage = () => {
  const { isDemoMode } = useDashboardContext();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank");
  const [amount, setAmount] = useState("");
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    swiftCode: "",
    paypalEmail: "",
    mobileNumber: "",
  });

  const paymentMethods = [
    { id: "bank", name: "Bank Transfer", icon: <BankIcon className="w-8 h-8 text-white" /> },
    { id: "paypal", name: "PayPal", icon: <PayPalIcon className="w-8 h-8" /> },
    { id: "mpesa", name: "M-Pesa", icon: <MpesaIcon className="w-8 h-8" /> },
    { id: "airtel", name: "Airtel Money", icon: <AirtelMoneyIcon className="w-8 h-8" /> },
  ];

  const handleWithdraw = async () => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Withdrawals are not available in demo mode",
        variant: "destructive",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    const isWalletMethod = selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'airtel';
    const minAmount = isWalletMethod ? 20 : 50;
    
    if (!amount || amountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    let isValid = true;
    let missingField = "";

    switch (selectedPaymentMethod) {
      case "bank":
        if (!accountDetails.bankName || !accountDetails.accountNumber || !accountDetails.accountName || !accountDetails.swiftCode) {
          isValid = false;
          missingField = "bank account";
        }
        break;
      case "paypal":
        if (!accountDetails.paypalEmail) {
          isValid = false;
          missingField = "PayPal email";
        }
        break;
      case "mpesa":
      case "airtel":
        if (!accountDetails.mobileNumber) {
          isValid = false;
          missingField = "mobile number";
        }
        break;
    }

    if (!isValid) {
      toast({
        title: "Missing Information",
        description: `Please enter your ${missingField} details`,
        variant: "destructive",
      });
      return;
    }

    const uid = localStorage.getItem('userId');
    if (!uid) {
      toast({
        title: "Authentication Error",
        description: "Please log in to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentBalance = await UserBalanceService.getUserBalance(uid);
      if (currentBalance < amountValue) {
        toast({
          title: "Insufficient Balance",
          description: `Your balance ($${currentBalance.toFixed(2)}) is insufficient for this withdrawal`,
          variant: "destructive",
        });
        return;
      }

      const newBalance = currentBalance - amountValue;
      await UserBalanceService.updateUserBalance(uid, newBalance);

      const transaction = {
        type: 'withdrawal',
        method: selectedPaymentMethod,
        amount: amountValue,
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: {
          ...accountDetails,
          paymentMethod: selectedPaymentMethod
        }
      };

      await UserService.updateUserData(uid, {
        transactions: firebase.firestore.FieldValue.arrayUnion(transaction)
      });

      setIsSuccessDialogOpen(true);
      
      toast({
        title: "Withdrawal Successful",
        description: `Your withdrawal of $${amountValue.toFixed(2)} has been processed`,
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: "An error occurred while processing your withdrawal",
        variant: "destructive",
      });
    }
  };

  const renderPaymentMethodFields = () => {
    switch (selectedPaymentMethod) {
      case "bank":
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Bank Name</Label>
              <Input
                type="text"
                value={accountDetails.bankName}
                onChange={(e) => setAccountDetails({ ...accountDetails, bankName: e.target.value })}
                className="bg-background/40 border-white/10 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label>Account Number</Label>
              <Input
                type="text"
                value={accountDetails.accountNumber}
                onChange={(e) => setAccountDetails({ ...accountDetails, accountNumber: e.target.value })}
                className="bg-background/40 border-white/10 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label>Account Holder Name</Label>
              <Input
                type="text"
                value={accountDetails.accountName}
                onChange={(e) => setAccountDetails({ ...accountDetails, accountName: e.target.value })}
                className="bg-background/40 border-white/10 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label>SWIFT/BIC Code</Label>
              <Input
                type="text"
                value={accountDetails.swiftCode}
                onChange={(e) => setAccountDetails({ ...accountDetails, swiftCode: e.target.value })}
                className="bg-background/40 border-white/10 text-white"
              />
            </div>
          </div>
        );
      case "paypal":
        return (
          <div className="grid gap-2">
            <Label>PayPal Email</Label>
            <Input
              type="email"
              value={accountDetails.paypalEmail}
              onChange={(e) => setAccountDetails({ ...accountDetails, paypalEmail: e.target.value })}
              className="bg-background/40 border-white/10 text-white"
            />
          </div>
        );
      case "mpesa":
      case "airtel":
        return (
          <div className="grid gap-2">
            <Label>Mobile Number</Label>
            <Input
              type="tel"
              value={accountDetails.mobileNumber}
              onChange={(e) => setAccountDetails({ ...accountDetails, mobileNumber: e.target.value })}
              className="bg-background/40 border-white/10 text-white"
              placeholder="e.g., +254712345678"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Withdraw Funds</h1>
            <p className="text-sm text-white/70 mt-1">Withdraw your funds securely</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader className="pb-3">
            <CardTitle>Select Withdrawal Method</CardTitle>
            <CardDescription className="text-white/70">
              Choose your preferred withdrawal method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-lg border transition-all",
                      selectedPaymentMethod === method.id
                        ? "border-[#F2FF44] bg-white/10"
                        : "border-white/10 hover:border-white/20 bg-background/40"
                    )}
                  >
                    {method.icon}
                    <span className="mt-2 text-white text-sm">{method.name}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {renderPaymentMethodFields()}

                <div className="grid gap-2">
                  <Label>Amount</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-background/40 border-white/10 text-white pr-16"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-white/70">USD</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] h-12 text-lg"
                  onClick={handleWithdraw}
                >
                  {isDemoMode ? "Demo Withdraw" : "Withdraw Funds"}
                </Button>

                <div className="text-sm text-white/70 p-4 bg-white/5 rounded-lg space-y-4">
                  <div>
                    <p className="font-medium text-white mb-2">Processing Times</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Bank Transfer: 1-3 business days</li>
                      <li>PayPal: Within 24 hours</li>
                      <li>Mobile Money: 5-10 minutes</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-2">Important Notes</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Minimum withdrawal (Bank Transfer/PayPal): $50.00</li>
                      <li>Minimum withdrawal (Mobile Money): $20.00</li>
                      <li>Maximum withdrawal: $50,000.00 per day</li>
                      <li>Verify your withdrawal details before confirming</li>
                      <li>Customer support available 24/7</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-lg border-white/10 text-white">
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold">Withdrawal Successful</h2>
            <p className="text-3xl font-bold">${amount} USD</p>
            <div className="w-full bg-white/10 rounded-lg p-4 mt-4">
              <p className="text-center text-sm text-white/70">
                Please check your {selectedPaymentMethod === 'bank' ? 'bank account' : 
                  selectedPaymentMethod === 'paypal' ? 'PayPal account' : 'mobile money account'} 
                for the received funds.
              </p>
            </div>
            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={() => setIsSuccessDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => window.location.href = '/history'}>
                View History
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WithdrawPage;
