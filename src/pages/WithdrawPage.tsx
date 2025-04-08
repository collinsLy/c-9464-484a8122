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
import { networkAddresses } from '@/lib/network-addresses';

const WithdrawPage = () => {
  const { isDemoMode } = useDashboardContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("crypto");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState('NATIVE');
  const [withdrawalAddress, setWithdrawalAddress] = useState("");

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

    if (!amount || (activeTab === 'crypto' && !withdrawalAddress)) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal Initiated",
      description: "Your withdrawal request has been submitted for processing",
    });
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
            <CardTitle>Withdrawal Options</CardTitle>
            <CardDescription className="text-white/70">
              Choose your preferred withdrawal method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-6 grid grid-cols-2 w-full">
                <TabsTrigger value="crypto" className="text-white data-[state=active]:bg-accent">
                  Crypto
                </TabsTrigger>
                <TabsTrigger value="fiat" className="text-white data-[state=active]:bg-accent">
                  Fiat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="crypto">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">1</span>
                        <h3 className="text-lg font-medium text-white">Select Coin</h3>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant={selectedCrypto === 'BTC' ? 'secondary' : 'outline'}
                          onClick={() => setSelectedCrypto('BTC')}
                          className="flex items-center gap-2"
                        >
                          <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="BTC" className="w-5 h-5" />
                          BTC
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
                        <h3 className="text-lg font-medium text-white">Enter Withdrawal Address</h3>
                      </div>
                      <div className="relative">
                        <Input
                          type="text"
                          value={withdrawalAddress}
                          onChange={(e) => setWithdrawalAddress(e.target.value)}
                          placeholder={`Enter your ${selectedCrypto} address`}
                          className="bg-background/40 border-white/10 text-white font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">3</span>
                        <h3 className="text-lg font-medium text-white">Amount</h3>
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="bg-background/40 border-white/10 text-white pr-16"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-white/70">{selectedCrypto}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] h-12 text-lg"
                      onClick={handleWithdraw}
                      disabled={!amount || !withdrawalAddress}
                    >
                      {isDemoMode ? "Demo Withdraw" : "Withdraw"}
                    </Button>

                    <div className="text-sm text-white/70 mt-6 p-4 bg-white/5 rounded-lg">
                      <p className="mb-2">Important Notes:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Double-check the withdrawal address before confirming</li>
                        <li>Minimum withdrawal: 0.001 {selectedCrypto}</li>
                        <li>Network fee will be deducted from the withdrawal amount</li>
                        <li>Withdrawals may take up to 30 minutes to process</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fiat">
                <div className="space-y-6">
                  <div>
                    <Label className="text-white text-lg">Select Payment Method</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-white">Amount</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-background/40 border-white/10 text-white placeholder:text-white/50 pr-16 text-lg"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-white/70 text-lg">USD</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] h-12 text-lg"
                    onClick={handleWithdraw}
                    disabled={!amount || parseFloat(amount) < 50}
                  >
                    {isDemoMode ? "Demo Withdraw" : `Withdraw $${amount || '0.00'}`}
                  </Button>

                  <div className="text-sm text-white/70 mt-6 p-4 bg-white/5 rounded-lg space-y-4">
                    <div>
                      <p className="font-medium text-white mb-2">Processing Time</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bank Transfer: 1-3 business days</li>
                        <li>PayPal: 24 hours</li>
                        <li>Mobile Money: 1-2 hours</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-white mb-2">Important Notes</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Minimum withdrawal amount: $50.00</li>
                        <li>Maximum withdrawal: $50,000.00 per day</li>
                        <li>Verify your account details before confirming</li>
                        <li>Customer support available 24/7</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WithdrawPage;