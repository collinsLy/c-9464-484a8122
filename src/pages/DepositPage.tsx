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

const DepositPage = () => {
  const { isDemoMode } = useDashboardContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("fiat");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState('NATIVE');

  // Get the deposit address based on selected crypto and network
  const getDepositAddress = () => {
    const networks = networkAddresses[selectedCrypto];
    const selectedNetwork = networks?.find(n => n.network === network);
    return selectedNetwork?.address || '';
  };

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: <div className="flex gap-2"><VisaIcon className="w-8 h-8" /><MastercardIcon className="w-8 h-8" /></div> },
    { id: "bank", name: "Bank Transfer", icon: <BankIcon className="w-8 h-8 text-white" /> },
    { id: "paypal", name: "PayPal", icon: <PayPalIcon className="w-8 h-8" /> },
    { id: "mpesa", name: "M-Pesa", icon: <MpesaIcon className="w-8 h-8" /> },
    { id: "airtel", name: "Airtel Money", icon: <AirtelMoneyIcon className="w-8 h-8" /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">How to Buy Crypto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background/40 backdrop-blur-lg border border-white/10 rounded-lg p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#F2FF44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">1. Enter Amount & Select Payment</h3>
              </div>
              <p className="text-white/70">Enter the amount, select the available payment method, and choose the payment account or bind the payment card.</p>
            </div>

            <div className="bg-background/40 backdrop-blur-lg border border-white/10 rounded-lg p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#F2FF44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">2. Confirm Order</h3>
              </div>
              <p className="text-white/70">Confirmation of transaction detail information, including trading pair quotes, fees, and other explanatory tips.</p>
            </div>

            <div className="bg-background/40 backdrop-blur-lg border border-white/10 rounded-lg p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#F2FF44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">3. Receive Crypto</h3>
              </div>
              <p className="text-white/70">After successful payment, the purchased crypto will be deposited into your Spot or Funding Wallet.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Deposit Funds</h1>
            <p className="text-sm text-white/70 mt-1">Deposit funds securely to your account</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader className="pb-3">
            <CardTitle>Deposit Options</CardTitle>
            <CardDescription className="text-white/70">
              Choose your preferred deposit method
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

              <TabsContent value="crypto">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">1</span>
                        <h3 className="text-lg font-medium text-white">Select Coin</h3>
                      </div>
                      <div className="mb-4">
                        <Input
                          type="text"
                          placeholder="Search Coin"
                          className="bg-background/40 border-white/10 text-white"
                        />
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
                          <img src="https://upload.wikimedia.org/wikipedia/commons/1/1c/BNB%2C_native_cryptocurrency_for_the_Binance_Smart_Chain.svg" alt="BNB" className="w-5 h-5" />
                          BNB
                        </Button>
                        <Button 
                          variant={selectedCrypto === 'WLD' ? 'secondary' : 'outline'}
                          onClick={() => setSelectedCrypto('WLD')}
                          className="flex items-center gap-2"
                        >
                          <img src="https://cryptologos.cc/logos/worldcoin-org-wld-logo.svg?v=040" alt="WLD" className="w-5 h-5" />
                          WLD
                        </Button>
                        <Button 
                          variant={selectedCrypto === 'USDC' ? 'secondary' : 'outline'}
                          onClick={() => setSelectedCrypto('USDC')}
                          className="flex items-center gap-2"
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Circle_USDC_Logo.svg" alt="USDC" className="w-5 h-5" />
                          USDC
                        </Button>
                        <Button 
                          variant={selectedCrypto === 'SOL' ? 'secondary' : 'outline'}
                          onClick={() => setSelectedCrypto('SOL')}
                          className="flex items-center gap-2"
                        >
                          <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/sol.svg" alt="SOL" className="w-5 h-5" />
                          SOL
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">2</span>
                        <h3 className="text-lg font-medium text-white">Select Network</h3>
                      </div>
                      <div className="flex gap-2 flex-wrap">
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
                        {selectedCrypto === 'USDT' && (
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
                        {selectedCrypto === 'BNB' && (
                          <>
                            <Button 
                              variant={network === 'BSC' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('BSC')}
                            >
                              Binance Smart Chain (BEP20)
                            </Button>
                            <Button 
                              variant={network === 'BEP2' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('BEP2')}
                            >
                              Binance Chain (BEP2)
                            </Button>
                            <Button 
                              variant={network === 'ERC20' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('ERC20')}
                            >
                              Ethereum (ERC20)
                            </Button>
                          </>
                        )}
                        {selectedCrypto === 'WLD' && (
                          <>
                            <Button 
                              variant={network === 'ERC20' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('ERC20')}
                            >
                              Ethereum (ERC20)
                            </Button>
                            <Button 
                              variant={network === 'OPTIMISM' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('OPTIMISM')}
                            >
                              Optimism
                            </Button>
                            <Button 
                              variant={network === 'WORLD' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('WORLD')}
                            >
                              World Chain (WLD)
                            </Button>
                          </>
                        )}
                        {selectedCrypto === 'USDC' && (
                          <>
                            <Button 
                              variant={network === 'ERC20' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('ERC20')}
                            >
                              Ethereum (ERC20)
                            </Button>
                            <Button 
                              variant={network === 'SOLANA' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('SOLANA')}
                            >
                              Solana (SPL)
                            </Button>
                            <Button 
                              variant={network === 'BSC' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('BSC')}
                            >
                              BNB Smart Chain (BEP20)
                            </Button>
                          </>
                        )}
                        {selectedCrypto === 'SOL' && (
                          <>
                            <Button 
                              variant={network === 'NATIVE' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('NATIVE')}
                            >
                              Solana (Native SPL)
                            </Button>
                            <Button 
                              variant={network === 'ERC20' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('ERC20')}
                            >
                              Ethereum (ERC20)
                            </Button>
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
                        <h3 className="text-lg font-medium text-white">Deposit Address</h3>
                      </div>
                      <div className="relative">
                        <Input
                          type="text"
                          readOnly
                          value={getDepositAddress()}
                          className="bg-background/40 border-white/10 text-white font-mono text-sm pr-24"
                        />
                        <Button 
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={async () => {
                            const address = getDepositAddress();
                            await navigator.clipboard.writeText(address);
                            toast({
                              title: "Address Copied",
                              description: "The deposit address has been copied to your clipboard",
                              duration: 2000,
                            });
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-white/70 mt-6 p-4 bg-white/5 rounded-lg">
                      <p className="mb-2">Important Notes:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Send only {selectedCrypto} to this address</li>
                        <li>Minimum deposit: 0.001 {selectedCrypto}</li>
                        <li>Deposits will be credited after {selectedCrypto === 'BTC' ? '2' : '12'} network confirmations</li>
                        <li>Please double-check the address before sending</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fiat">
                <div className="space-y-6">
                  <div className="grid gap-6">
                    <div className="grid gap-4">
                      <Label className="text-white text-lg">Select Payment Method</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      disabled={!amount || parseFloat(amount) < 10}
                    >
                      {isDemoMode ? "Demo Deposit" : `Pay $${amount || '0.00'}`}
                    </Button>
                  </div>
                  <div className="text-sm text-white/70 mt-6 p-4 bg-white/5 rounded-lg space-y-4">
                    <div>
                      <p className="font-medium text-white mb-2">Processing Time</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Credit/Debit Card: Instant</li>
                        <li>Bank Transfer: 1-3 business days</li>
                        <li>PayPal: Instant</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-white mb-2">Important Notes</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Minimum deposit amount: $10.00</li>
                        <li>Maximum single deposit: $10,000.00</li>
                        <li>All payment methods are secure and encrypted</li>
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

export default DepositPage;