import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Check, Copy } from 'lucide-react';
import { UserBalanceService } from '@/lib/firebase-service';
import { UserService } from '@/lib/user-service';
import { getFirestore, arrayUnion } from 'firebase/firestore';
import { useDashboardContext } from '@/components/dashboard/DashboardLayout';
import { useToast } from "@/components/ui/use-toast";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BankIcon, PayPalIcon, MpesaIcon, AirtelMoneyIcon } from '@/assets/payment-icons';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WithdrawPage = () => {
  const { isDemoMode } = useDashboardContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("fiat");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("NATIVE");
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

    // Handle crypto or fiat withdrawal based on active tab
    if (activeTab === 'crypto') {
      return handleCryptoWithdraw();
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
        type: 'Withdrawal',
        method: selectedPaymentMethod,
        amount: amountValue,
        status: 'Completed',
        timestamp: new Date().toISOString(),
        txId: `TX${Date.now()}`,
        details: {
          paymentMethod: selectedPaymentMethod,
          ...accountDetails
        }
      };

      await UserService.updateUserData(uid, {
        transactions: arrayUnion(transaction)
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

  // Handle crypto withdrawal
  const handleCryptoWithdraw = async () => {
    const cryptoAmountValue = parseFloat(cryptoAmount);
    
    if (!cryptoAmountValue || cryptoAmountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (!walletAddress) {
      toast({
        title: "Missing Wallet Address",
        description: "Please enter your crypto wallet address",
        variant: "destructive",
      });
      return;
    }

    // Estimate USD value based on crypto (in a real app this would fetch current exchange rate)
    const estimatedUsdValue = cryptoAmountValue * getEstimatedRate(selectedCrypto);
    
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
      if (currentBalance < estimatedUsdValue) {
        toast({
          title: "Insufficient Balance",
          description: `Your balance ($${currentBalance.toFixed(2)}) is insufficient for this withdrawal`,
          variant: "destructive",
        });
        return;
      }

      const newBalance = currentBalance - estimatedUsdValue;
      await UserBalanceService.updateUserBalance(uid, newBalance);

      const transaction = {
        type: 'Withdrawal',
        method: 'crypto',
        amount: estimatedUsdValue,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        txId: `TX${Date.now()}`,
        details: {
          crypto: selectedCrypto,
          network: network,
          amount: cryptoAmountValue,
          walletAddress: walletAddress,
        }
      };

      await UserService.updateUserData(uid, {
        transactions: arrayUnion(transaction)
      });

      setIsSuccessDialogOpen(true);

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal of ${cryptoAmountValue} ${selectedCrypto} has been submitted`,
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

  // Get estimated rate for a cryptocurrency (simplified)
  const getEstimatedRate = (crypto: string) => {
    const rates: Record<string, number> = {
      'BTC': 66000,
      'ETH': 3500,
      'USDT': 1,
      'USDC': 1,
      'BNB': 600,
      'WLD': 3.5
    };
    return rates[crypto] || 1;
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-6 grid grid-cols-2 w-full">
                <TabsTrigger value="fiat" className="text-white data-[state=active]:bg-accent">
                  Fiat
                </TabsTrigger>
                <TabsTrigger value="crypto" className="text-white data-[state=active]:bg-accent">
                  Crypto
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="fiat" className="space-y-6">
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
              </TabsContent>
              
              <TabsContent value="crypto" className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">1</span>
                    <h3 className="text-lg font-medium text-white">Select Cryptocurrency</h3>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-6">
                    <Button 
                      variant={selectedCrypto === 'BTC' ? 'secondary' : 'outline'}
                      onClick={() => setSelectedCrypto('BTC')}
                      className="flex items-center gap-2"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="BTC" className="w-5 h-5" />
                      BTC
                    </Button>
                    <Button 
                      variant={selectedCrypto === 'ETH' ? 'secondary' : 'outline'}
                      onClick={() => setSelectedCrypto('ETH')}
                      className="flex items-center gap-2"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg" alt="ETH" className="w-5 h-5" />
                      ETH
                    </Button>
                    <Button 
                      variant={selectedCrypto === 'USDT' ? 'secondary' : 'outline'}
                      onClick={() => setSelectedCrypto('USDT')}
                      className="flex items-center gap-2"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg" alt="USDT" className="w-5 h-5" />
                      USDT
                    </Button>
                    <Button 
                      variant={selectedCrypto === 'USDC' ? 'secondary' : 'outline'}
                      onClick={() => setSelectedCrypto('USDC')}
                      className="flex items-center gap-2"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdc.svg" alt="USDC" className="w-5 h-5" />
                      USDC
                    </Button>
                    <Button 
                      variant={selectedCrypto === 'BNB' ? 'secondary' : 'outline'}
                      onClick={() => setSelectedCrypto('BNB')}
                      className="flex items-center gap-2"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/bnb.svg" alt="BNB" className="w-5 h-5" />
                      BNB
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">2</span>
                    <h3 className="text-lg font-medium text-white">Select Network</h3>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-6">
                    {selectedCrypto === 'BTC' && (
                      <>
                        <Button 
                          variant={network === 'NATIVE' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('NATIVE')}
                        >
                          Bitcoin (Native)
                        </Button>
                        <Button 
                          variant={network === 'BSC' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('BSC')}
                        >
                          Binance Smart Chain (BEP20)
                        </Button>
                      </>
                    )}
                    {(selectedCrypto === 'USDT' || selectedCrypto === 'USDC') && (
                      <>
                        <Button 
                          variant={network === 'ERC20' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('ERC20')}
                        >
                          Ethereum (ERC20)
                        </Button>
                        <Button 
                          variant={network === 'TRC20' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('TRC20')}
                        >
                          Tron (TRC20)
                        </Button>
                        <Button 
                          variant={network === 'BSC' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('BSC')}
                        >
                          Binance Smart Chain (BEP20)
                        </Button>
                      </>
                    )}
                    {selectedCrypto === 'ETH' && (
                      <>
                        <Button 
                          variant={network === 'ERC20' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('ERC20')}
                        >
                          Ethereum (ERC20)
                        </Button>
                        <Button 
                          variant={network === 'ARBITRUM' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('ARBITRUM')}
                        >
                          Arbitrum
                        </Button>
                        <Button 
                          variant={network === 'OPTIMISM' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('OPTIMISM')}
                        >
                          Optimism
                        </Button>
                      </>
                    )}
                    {selectedCrypto === 'BNB' && (
                      <>
                        <Button 
                          variant={network === 'BSC' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('BSC')}
                        >
                          Binance Smart Chain (BEP20)
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">3</span>
                    <h3 className="text-lg font-medium text-white">Enter Wallet Address</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Recipient Address</Label>
                      <Input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="bg-background/40 border-white/10 text-white"
                        placeholder={`Enter your ${selectedCrypto} address`}
                      />
                      <p className="text-sm text-white/50">Make sure the address is correct and supports the {network} network.</p>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Amount</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={cryptoAmount}
                          onChange={(e) => setCryptoAmount(e.target.value)}
                          className="bg-background/40 border-white/10 text-white pr-16"
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-white/70">{selectedCrypto}</span>
                        </div>
                      </div>
                      {cryptoAmount && (
                        <p className="text-sm text-white/70">
                          ≈ ${(parseFloat(cryptoAmount || '0') * getEstimatedRate(selectedCrypto)).toFixed(2)} USD
                        </p>
                      )}
                    </div>

                    <Button 
                      className="w-full bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] h-12 text-lg mt-4"
                      onClick={handleWithdraw}
                    >
                      {isDemoMode ? "Demo Withdraw" : "Withdraw Crypto"}
                    </Button>

                    <div className="text-sm text-white/70 p-4 bg-white/5 rounded-lg space-y-4">
                      <div>
                        <p className="font-medium text-white mb-2">Important Notes</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Minimum withdrawal: {selectedCrypto === 'BTC' ? '0.001' : selectedCrypto === 'ETH' ? '0.01' : '10'} {selectedCrypto}</li>
                          <li>Network fee: Varies based on blockchain congestion</li>
                          <li>Processing time: 10-30 minutes after confirmations</li>
                          <li>Always double-check the wallet address and network</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-lg border-white/10 text-white">
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold">Withdrawal {activeTab === 'crypto' ? 'Request Submitted' : 'Successful'}</h2>
            {activeTab === 'crypto' ? (
              <p className="text-3xl font-bold">{cryptoAmount} {selectedCrypto}</p>
            ) : (
              <p className="text-3xl font-bold">${amount} USD</p>
            )}
            <div className="w-full bg-white/10 rounded-lg p-4 mt-4">
              {activeTab === 'crypto' ? (
                <p className="text-center text-sm text-white/70">
                  Your withdrawal request has been submitted. Crypto withdrawals typically take 10-30 minutes to process after blockchain confirmations.
                </p>
              ) : (
                <p className="text-center text-sm text-white/70">
                  Please check your {selectedPaymentMethod === 'bank' ? 'bank account' : 
                    selectedPaymentMethod === 'paypal' ? 'PayPal account' : 'mobile money account'} for the received funds.
                </p>
              )}
            </div>
            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={() => setIsSuccessDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => window.location.href = '/dashboard?tab=history'}>
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