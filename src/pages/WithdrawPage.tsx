import { useState, useEffect } from 'react';
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
import {auth} from "@/lib/firebase"; // Assuming firebase auth is imported here

import DashboardHeader from '@/components/dashboard/DashboardHeader';


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
  const [userCryptoBalances, setUserCryptoBalances] = useState<Record<string, number>>({});
  const [accountDetails, setAccountDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    swiftCode: "",
    paypalEmail: "",
    mobileNumber: "",
  });
  const [userUid, setUserUid] = useState("");

  // Get current user UID when component loads
  useEffect(() => {
    setUserUid(auth.currentUser?.uid || "");
  }, []);

  // Fetch user's crypto balances when the component loads
  useEffect(() => {
    const fetchUserCryptoBalances = async () => {
      const uid = localStorage.getItem('userId');
      if (!uid) return;

      try {
        const userData = await UserService.getUserData(uid);

        // Create a default balance object for all supported cryptocurrencies
        const supportedCryptos = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB'];
        const defaultBalances = supportedCryptos.reduce((acc, crypto) => {
          acc[crypto] = 0;
          return acc;
        }, {} as Record<string, number>);

        // If user has assets, merge them with defaults
        if (userData && userData.assets) {
          // Log raw user assets for debugging
          console.log("Raw user assets:", userData.assets);

          // Process each asset and add to our balances object
          Object.entries(userData.assets).forEach(([key, asset]: [string, any]) => {
            if (asset && (typeof asset.amount === 'number' || typeof asset.amount === 'string')) {
              // Convert to number if it's a string
              defaultBalances[key] = Number(asset.amount);
            }
          });

          // Ensure USDT is correctly processed
          if (userData.assets.USDT) {
            const usdtAmount = userData.assets.USDT.amount;
            defaultBalances['USDT'] = Number(usdtAmount) || 0;
            console.log("USDT amount specifically:", usdtAmount, "Converted:", defaultBalances['USDT']);
          }

          console.log("Processed crypto balances:", defaultBalances);
        } else {
          console.log("No assets found in user data, using defaults");
        }

        // Set the balances in state
        setUserCryptoBalances(defaultBalances);
      } catch (error) {
        console.error("Error fetching crypto balances:", error);
      }
    };

    fetchUserCryptoBalances();

    // Set up a listener for real-time updates to user data
    const uid = localStorage.getItem('userId');
    if (uid) {
      const unsubscribe = UserService.subscribeToUserData(uid, (userData) => {
        if (userData && userData.assets) {
          const balances = Object.keys(userData.assets).reduce((acc, key) => {
            acc[key] = userData.assets[key].amount || 0;
            return acc;
          }, {} as Record<string, number>);

          // Always maintain all supported cryptocurrencies in the state
          const supportedCryptos = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB'];
          const completeBalances = { ...balances };

          supportedCryptos.forEach(crypto => {
            if (completeBalances[crypto] === undefined) {
              completeBalances[crypto] = 0;
            }
          });

          console.log("Updated crypto balances from subscription:", completeBalances);
          setUserCryptoBalances(completeBalances);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // Function to get and display user's current crypto balance
  const getUserCryptoBalance = () => {
    const balance = userCryptoBalances[selectedCrypto] || 0;
    return `Available: ${balance.toFixed(4)} ${selectedCrypto}`;
  };

  // Update the UI when cryptocurrency is selected or balances change
  useEffect(() => {
    console.log(`Selected crypto: ${selectedCrypto}, Available balance:`, userCryptoBalances[selectedCrypto] || 0);

    // Fetch latest balance from Firebase whenever crypto selection changes
    const fetchLatestBalance = async () => {
      const uid = localStorage.getItem('userId');
      if (!uid) return;

      try {
        const userData = await UserService.getUserData(uid);
        if (userData && userData.assets) {
          // Explicitly handle USDT balance correctly
          let balance = 0;

          // Check if the asset exists in user data
          if (userData.assets[selectedCrypto]) {
            balance = userData.assets[selectedCrypto].amount || 0;
          }

          console.log(`Fresh balance check for ${selectedCrypto}:`, balance);

          // Update the specific crypto that was selected
          setUserCryptoBalances(prev => ({
            ...prev,
            [selectedCrypto]: balance
          }));
        }
      } catch (error) {
        console.error(`Error fetching latest balance for ${selectedCrypto}:`, error);
      }
    };

    fetchLatestBalance();

    // Reset amount if it exceeds the available balance when switching cryptos
    if (cryptoAmount && parseFloat(cryptoAmount) > (userCryptoBalances[selectedCrypto] || 0)) {
      setCryptoAmount("");
    }

    // Set appropriate networks based on the selected crypto
    if (selectedCrypto === 'BTC' && !['NATIVE', 'BSC'].includes(network)) {
      setNetwork('NATIVE');
    } else if (selectedCrypto === 'ETH' && !['ERC20', 'ARBITRUM', 'OPTIMISM'].includes(network)) {
      setNetwork('ERC20');
    } else if (selectedCrypto === 'BNB' && network !== 'BSC') {
      setNetwork('BSC');
    } else if ((selectedCrypto === 'USDT' || selectedCrypto === 'USDC') && 
               !['ERC20', 'TRC20', 'BSC'].includes(network)) {
      setNetwork('ERC20');
    }
  }, [selectedCrypto]);

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

  // Get minimum withdrawal amount for each cryptocurrency
  const getMinimumWithdrawalAmount = (crypto: string): number => {
    const minimums: Record<string, number> = {
      'BTC': 0.001,
      'ETH': 0.01,
      'USDT': 10,
      'USDC': 10,
      'BNB': 0.01,
      'WLD': 10
    };
    return minimums[crypto] || 0.001;
  };

  // Handle crypto withdrawal
  const handleCryptoWithdraw = async () => {
    console.log(`Starting withdrawal process for ${selectedCrypto}`);
    const cryptoAmountValue = parseFloat(cryptoAmount);

    if (!cryptoAmountValue || cryptoAmountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    // Check minimum withdrawal amount
    const minAmount = getMinimumWithdrawalAmount(selectedCrypto);
    if (cryptoAmountValue < minAmount) {
      toast({
        title: "Below Minimum",
        description: `Minimum withdrawal amount is ${minAmount} ${selectedCrypto}`,
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

    if (!network) {
      toast({
        title: "Missing Network",
        description: "Please select a blockchain network",
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

    // Double-check with latest data from the database first
    let userData;
    let userAssets;
    let cryptoBalance;

    try {
      // Get fresh user data from the database
      userData = await UserService.getUserData(uid);

      if (!userData) {
        toast({
          title: "User Data Error",
          description: "Unable to fetch your account data",
          variant: "destructive",
        });
        return;
      }

      // Get user's crypto assets
      userAssets = userData.assets || {};
      cryptoBalance = userAssets[selectedCrypto]?.amount || 0;

      console.log(`Database check - ${selectedCrypto} balance:`, cryptoBalance);

      // Update local state to match database
      setUserCryptoBalances(prev => ({
        ...prev,
        [selectedCrypto]: cryptoBalance
      }));

      // Check if user has sufficient balance for the selected crypto
      if (cryptoBalance < cryptoAmountValue) {
        toast({
          title: `Insufficient ${selectedCrypto} Balance`,
          description: `You only have ${cryptoBalance.toFixed(8)} ${selectedCrypto} available for withdrawal`,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error("Error checking crypto balance:", error);
      toast({
        title: "Balance Check Failed",
        description: "Failed to verify your crypto balance",
        variant: "destructive",
      });
      return;
    }

    try {
      // Skip USD balance check - this was causing confusion
      // Instead just check the crypto balance which we already confirmed above

      // Estimate USD value based on crypto (in a real app this would fetch current exchange rate)
      const estimatedUsdValue = cryptoAmountValue * getEstimatedRate(selectedCrypto);
      console.log(`Withdrawing ${cryptoAmountValue} ${selectedCrypto} (≈ $${estimatedUsdValue})`);

      // Update crypto balance by decreasing the amount
      const updatedUserAssets = { ...userAssets };
      const newCryptoAmount = cryptoBalance - cryptoAmountValue;

      if (newCryptoAmount <= 0) {
        // If balance becomes zero or negative, set to zero
        if (updatedUserAssets[selectedCrypto]) {
          updatedUserAssets[selectedCrypto] = {
            ...updatedUserAssets[selectedCrypto],
            amount: 0
          };
        }
      } else {
        // Otherwise update with new amount
        updatedUserAssets[selectedCrypto] = {
          ...updatedUserAssets[selectedCrypto],
          amount: newCryptoAmount
        };
      }

      // Create the transaction with Pending status
      const transaction = {
        type: 'Withdrawal',
        method: 'crypto',
        crypto: selectedCrypto,  // Explicitly store the crypto type
        amount: estimatedUsdValue,
        cryptoAmount: cryptoAmountValue,  // Store the actual crypto amount
        status: 'Pending',
        timestamp: new Date().toISOString(),
        txId: `TX${Date.now()}`,
        details: {
          crypto: selectedCrypto,
          network: network,
          amount: cryptoAmountValue,
          walletAddress: walletAddress,
          processingStartTime: new Date().toISOString(),
          expectedCompletionTime: new Date(Date.now() + (25 * 60 * 1000)).toISOString() // 25 minutes from now
        }
      };

      // Update the user's assets in Firebase
      await UserService.updateUserData(uid, {
        assets: updatedUserAssets,
        transactions: arrayUnion(transaction)
      });

      console.log(`Transaction ${transaction.txId} created, updated assets`);

      // Update balances in state to reflect immediately in UI
      setUserCryptoBalances(prevBalances => ({
        ...prevBalances,
        [selectedCrypto]: newCryptoAmount
      }));

      // Immediately update to Processing
      setTimeout(async () => {
        try {
          console.log(`Updating ${transaction.txId} to Processing status`);

          // Direct update to Processing without fetching first
          await UserService.updateUserData(uid, {
            transactions: arrayUnion({
              ...transaction,
              status: 'Processing'
            })
          });

          toast({
            title: "Withdrawal Update",
            description: `Your ${cryptoAmountValue} ${selectedCrypto} withdrawal is now processing.`,
          });

          // Then update to Completed after just 5 seconds
          setTimeout(async () => {
            try {
              console.log(`Updating ${transaction.txId} to Completed status`);

              // Get updated data first
              const userData = await UserService.getUserData(uid);
              if (!userData || !userData.transactions) return;

              // Filter out duplicate transactions and keep only the most recent one
              const uniqueTxIds = new Set();
              const filteredTransactions = userData.transactions.filter((tx: any) => {
                if (uniqueTxIds.has(tx.txId)) {
                  return false;
                }
                uniqueTxIds.add(tx.txId);
                return true;
              });

              // Update the specific transaction
              const finalTransactions = filteredTransactions.map((tx: any) => {
                if (tx.txId === transaction.txId) {
                  return { ...tx, status: 'Completed' };
                }
                return tx;
              });

              // Replace all transactions
              await UserService.updateUserData(uid, { 
                transactions: finalTransactions 
              });

              toast({
                title: "Withdrawal Completed",
                description: `Your ${cryptoAmountValue} ${selectedCrypto} withdrawal has been completed.`,
              });
            } catch (err) {
              console.error("Error updating transaction status to Completed:", err);
            }
          }, 5000); // Just 5 seconds later

        } catch (err) {
          console.error("Error updating transaction status to Processing:", err);
        }
      }, 100); // Almost immediate

      // Clear input fields after successful transaction
      setCryptoAmount("");
      setWalletAddress("");

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

  // Validate wallet address format based on cryptocurrency and network
  const isValidWalletAddress = (address: string, crypto: string, network: string): boolean => {
    if (!address.trim()) return false;

    // Basic validation patterns
    const patterns = {
      BTC_NATIVE: /^(1|3|bc1)[a-zA-Z0-9]{25,42}$/,
      ETH_ERC20: /^0x[a-fA-F0-9]{40}$/,
      BNB_BSC: /^0x[a-fA-F0-9]{40}$/,
      USDT_TRC20: /^T[a-zA-Z0-9]{33}$/,
      USDT_ERC20: /^0x[a-fA-F0-9]{40}$/,
      USDT_BSC: /^0x[a-fA-F0-9]{40}$/,
      USDC_ERC20: /^0x[a-fA-F0-9]{40}$/,
      USDC_BSC: /^0x[a-fA-F0-9]{40}$/,
      ETH_ARBITRUM: /^0x[a-fA-F0-9]{40}$/,
      ETH_OPTIMISM: /^0x[a-fA-F0-9]{40}$/,
    };

    const key = `${crypto}_${network}`;

    // If specific pattern exists, use it
    if (patterns[key as keyof typeof patterns]) {
      return patterns[key as keyof typeof patterns].test(address);
    }

    // Default pattern based on network
    if (network === 'BSC' || network === 'ERC20' || network === 'ARBITRUM' || network === 'OPTIMISM') {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    } else if (network === 'TRC20') {
      return /^T[a-zA-Z0-9]{33}$/.test(address);
    } else if (network === 'NATIVE' && crypto === 'BTC') {
      return /^(1|3|bc1)[a-zA-Z0-9]{25,42}$/.test(address);
    }

    // Basic length check for other networks
    return address.length >= 25 && address.length <= 128;
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">1</span>
                      <h3 className="text-lg font-medium text-white">Select Cryptocurrency</h3>
                    </div>
                    <div className="text-sm text-white/70">
                      {getUserCryptoBalance()}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-6">
                    {[
                      { symbol: 'BTC', name: 'Bitcoin' },
                      { symbol: 'ETH', name: 'Ethereum' },
                      { symbol: 'USDT', name: 'Tether' },
                      { symbol: 'USDC', name: 'USD Coin' },
                      { symbol: 'BNB', name: 'Binance Coin' }
                    ].map((crypto) => {
                      const balance = userCryptoBalances[crypto.symbol] || 0;
                      return (
                        <Button 
                          key={crypto.symbol}
                          variant={selectedCrypto === crypto.symbol ? 'secondary' : 'outline'}
                          onClick={async () => {
                            // First update the UI
                            setSelectedCrypto(crypto.symbol);

                            console.log(`Selected ${crypto.symbol}, state balance: ${balance}`);

                            // Reset network to appropriate default for this crypto
                            if (crypto.symbol === 'BTC') {
                              setNetwork('NATIVE');
                            } else if (crypto.symbol === 'ETH') {
                              setNetwork('ERC20');
                            } else if (crypto.symbol === 'BNB') {
                              setNetwork('BSC');
                            } else {
                              setNetwork('ERC20'); // Default for USDT, USDC, etc.
                            }

                            // Immediately fetch the latest balance from Firebase
                            const uid = localStorage.getItem('userId');
                            if (uid) {
                              try {
                                const userData = await UserService.getUserData(uid);
                                if (userData && userData.assets) {
                                  // Log all assets for debugging
                                  console.log("All user assets:", userData.assets);

                                  // Get fresh balance with proper null/undefined handling
                                  let freshBalance = 0;

                                  // Special handling for USDT to ensure it works correctly
                                  if (crypto.symbol === 'USDT' && userData.assets.USDT) {
                                    freshBalance = userData.assets.USDT.amount || 0;
                                    console.log(`USDT balance specifically: ${freshBalance}`);
                                  } 
                                  // Standard handling for other assets
                                  else if (userData.assets[crypto.symbol]) {
                                    freshBalance = userData.assets[crypto.symbol].amount || 0;
                                  }

                                  console.log(`Firebase check for ${crypto.symbol}: ${freshBalance}`);

                                  // Update UI with fresh balance - force it to be a number
                                  setUserCryptoBalances(prev => ({
                                    ...prev,
                                    [crypto.symbol]: Number(freshBalance)
                                  }));
                                }
                              } catch (error) {
                                console.error(`Error fetching ${crypto.symbol} balance:`, error);
                              }
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <img 
                            src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`} 
                            alt={crypto.symbol} 
                            className="w-5 h-5" 
                            onError={(e) => {
                              e.currentTarget.src = "https://assets.coingecko.com/coins/images/1/small/bitcoin.png";
                            }}
                          />
                          {crypto.symbol}
                          <span className={`text-xs ml-1 ${balance > 0 ? 'text-green-500' : 'opacity-70'}`}>
                            {`(${balance.toFixed(4)})`}
                          </span>
                        </Button>
                      );
                    })}
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
                        className={`bg-background/40 border-white/10 text-white ${
                          walletAddress && !isValidWalletAddress(walletAddress, selectedCrypto, network) ? 
                            'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                        placeholder={`Enter your ${selectedCrypto} address for ${network} network`}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white/50">
                          Make sure the address is correct and supports the {network} network.
                        </p>
                        {walletAddress && !isValidWalletAddress(walletAddress, selectedCrypto, network) && (
                          <p className="text-sm text-red-400">Invalid address format for {network}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <Label>Amount</Label>
                        <span 
                          className="text-sm text-white/70 cursor-pointer hover:text-white/90 bg-white/5 px-2 py-1 rounded-md transition-colors" 
                          onClick={() => {
                            const maxBalance = userCryptoBalances[selectedCrypto] || 0;
                            setCryptoAmount(maxBalance.toString());
                          }}
                        >
                          Max: {(userCryptoBalances[selectedCrypto] || 0).toFixed(8)} {selectedCrypto}
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          value={cryptoAmount}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Prevent negative values
                            if (parseFloat(value) >= 0 || value === '') {
                              setCryptoAmount(value);
                            }
                          }}
                          min="0"
                          step="0.00000001"
                          className={`bg-background/40 border-white/10 text-white pr-16 ${
                            cryptoAmount && parseFloat(cryptoAmount) > (userCryptoBalances[selectedCrypto] || 0) 
                              ? 'border-red-500 focus-visible:ring-red-500' 
                              : ''
                          }`}
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-white/70">{selectedCrypto}</span>
                        </div>
                      </div>
                      {cryptoAmount && (
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex justify-between">
                            <p className="text-white/70">
                              ≈ ${(parseFloat(cryptoAmount || '0') * getEstimatedRate(selectedCrypto)).toFixed(2)} USD
                            </p>
                            {parseFloat(cryptoAmount) > (userCryptoBalances[selectedCrypto] || 0) && (
                              <p className="text-red-400">Insufficient {selectedCrypto} balance</p>
                            )}
                          </div>

                          {/* Network fee estimate */}
                          <div className="flex justify-between text-xs text-white/60">
                            <span>Network Fee:</span>
                            <span>{network === 'ERC20' ? '~0.001 ETH' : 
                                  network === 'TRC20' ? '~1 TRX' : 
                                  network === 'BSC' ? '~0.0005 BNB' :
                                  network === 'NATIVE' && selectedCrypto === 'BTC' ? '~0.0001 BTC' :
                                  '~0.0001'}</span>
                          </div>

                          {/* Minimum withdrawal amount */}
                          <div className="flex justify-between text-xs text-white/60">
                            <span>Minimum withdrawal:</span>
                            <span>{selectedCrypto === 'BTC' ? '0.001 BTC' : 
                                  selectedCrypto === 'ETH' ? '0.01 ETH' : 
                                  selectedCrypto === 'BNB' ? '0.01 BNB' :
                                  '10 ' + selectedCrypto}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] h-12 text-lg mt-4"
                      onClick={handleWithdraw}
                      disabled={
                        !walletAddress || 
                        !isValidWalletAddress(walletAddress, selectedCrypto, network) ||
                        !cryptoAmount || 
                        parseFloat(cryptoAmount) <= 0 ||
                        parseFloat(cryptoAmount) > (userCryptoBalances[selectedCrypto] || 0) ||
                        parseFloat(cryptoAmount) < getMinimumWithdrawalAmount(selectedCrypto)
                      }
                    >
                      {isDemoMode ? "Demo Withdraw" : "Withdraw Crypto"}
                    </Button>

                    {/* Validation messages */}
                    {(
                      (!walletAddress || !isValidWalletAddress(walletAddress, selectedCrypto, network)) ||
                      (!cryptoAmount || parseFloat(cryptoAmount) <= 0) ||
                      (parseFloat(cryptoAmount) > (userCryptoBalances[selectedCrypto] || 0)) ||
                      (cryptoAmount && parseFloat(cryptoAmount) < getMinimumWithdrawalAmount(selectedCrypto))
                    ) && (
                      <div className="mt-2 p-2 bg-red-500/10 rounded-md">
                        {!walletAddress && <p className="text-xs text-red-400 mb-1">⚠️ Please enter a wallet address</p>}
                        {walletAddress && !isValidWalletAddress(walletAddress, selectedCrypto, network) && 
                          <p className="text-xs text-red-400 mb-1">⚠️ Invalid wallet address format</p>}
                        {(!cryptoAmount || parseFloat(cryptoAmount) <= 0) && 
                          <p className="text-xs text-red-400 mb-1">⚠️ Please enter a valid amount</p>}
                        {parseFloat(cryptoAmount) > (userCryptoBalances[selectedCrypto] || 0) && 
                          <p className="text-xs text-red-400 mb-1">⚠️ Insufficient balance</p>}
                        {cryptoAmount && parseFloat(cryptoAmount) < getMinimumWithdrawalAmount(selectedCrypto) && 
                          <p className="text-xs text-red-400 mb-1">⚠️ Amount below minimum withdrawal</p>}
                      </div>
                    )}

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
        
        {/* UID Display Section */}
        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <span>Your UID</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(userUid);
                  toast({
                    title: "Copied!",
                    description: "Your UID has been copied to clipboard",
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </CardTitle>
            <CardDescription>
              Share this UID with others who want to send you funds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="block w-full p-3 bg-background/60 border border-white/10 rounded-md font-mono text-sm">
              {userUid || "Loading..."}
            </code>
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