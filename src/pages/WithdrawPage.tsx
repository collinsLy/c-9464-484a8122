
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDashboardContext } from '@/components/dashboard/DashboardLayout';
import { useToast } from "@/components/ui/use-toast";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { VisaIcon, MastercardIcon, PayPalIcon, BankIcon, MpesaIcon, AirtelMoneyIcon } from '@/assets/payment-icons';
import { cn } from '@/lib/utils';

const WithdrawPage = () => {
  const { isDemoMode } = useDashboardContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("fiat");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank");
  const [amount, setAmount] = useState("");
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

  const handleWithdraw = () => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Withdrawals are not available in demo mode",
        variant: "destructive",
      });
      return;
    }

    // Validate inputs based on payment method
    if (!amount || parseFloat(amount) <= 0) {
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

    toast({
      title: "Withdrawal Initiated",
      description: "Your withdrawal request has been submitted for processing",
    });
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
                      <li>Mobile Money: 1-2 hours</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-2">Important Notes</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Minimum withdrawal: $50.00</li>
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
    </DashboardLayout>
  );
};

export default WithdrawPage;
