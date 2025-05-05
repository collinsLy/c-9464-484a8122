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
import UidTransfer from "@/components/dashboard/UidTransfer";


const DepositPage = () => {
  const { isDemoMode } = useDashboardContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("fiat");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState('NATIVE');
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const fetchUserBalance = () => { /* Implementation needed to fetch user balance */ };

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
                      <div className="mb-4">
                        <Input
                          type="text"
                          placeholder="Search Coin"
                          className="bg-background/40 border-white/10 text-white"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { symbol: 'BTC', name: 'Bitcoin' },
                          { symbol: 'ETH', name: 'Ethereum' },
                          { symbol: 'USDT', name: 'Tether' },
                          { symbol: 'USDC', name: 'USD Coin' },
                          { symbol: 'BNB', name: 'Binance Coin' },
                          { symbol: 'DOGE', name: 'Dogecoin' },
                          { symbol: 'SOL', name: 'Solana' },
                          { symbol: 'XRP', name: 'Ripple' },
                          { symbol: 'WLD', name: 'Worldcoin' },
                          { symbol: 'ADA', name: 'Cardano' },
                          { symbol: 'DOT', name: 'Polkadot' },
                          { symbol: 'LINK', name: 'Chainlink' },
                          { symbol: 'MATIC', name: 'Polygon' }
                        ].map((crypto) => (
                          <Button 
                            key={crypto.symbol}
                            variant={selectedCrypto === crypto.symbol ? 'secondary' : 'outline'}
                            onClick={() => setSelectedCrypto(crypto.symbol)}
                            className="flex items-center gap-2"
                          >
                            <img 
                              src={crypto.symbol === 'WLD' 
                                ? "https://cryptologos.cc/logos/worldcoin-org-wld-logo.svg?v=040" 
                                : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`} 
                              alt={crypto.symbol} 
                              className="w-5 h-5"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                              }}
                            />
                            {crypto.symbol}
                          </Button>
                        ))}
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
                          onChange={(e) => {
                            const newAmount = e.target.value;
                            setAmount(newAmount);
                            if ((selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'airtel') && parseFloat(newAmount) > 15) {
                              toast({
                                title: "First Deposit Limit",
                                description: "For your first deposit with mobile money, the maximum amount is $15 (KES 2,300)",
                                variant: "destructive"
                              });
                            }
                          }}
                          placeholder="0.00"
                          className="bg-background/40 border-white/10 text-white placeholder:text-white/50 pr-16 text-lg"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-white/70 text-lg">USD</span>
                        </div>
                      </div>
                      {(selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'airtel') && (
                        <p className="text-sm text-yellow-400">First deposit limit: $15 (KES 2,300)</p>
                      )}
                    </div>
                    <Button 
                      className="w-full bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] h-12 text-lg"
                      disabled={!amount || 
                        parseFloat(amount) < 10 || 
                        ((selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'airtel') && parseFloat(amount) > 15)
                      }
                      onClick={() => {
                        // Show payment iframe instead of redirecting
                        setShowPaymentIframe(true);
                      }}
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

              {/* No UID transfer on this page */}
            </Tabs>
          </CardContent>
        </Card>
        
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">How to Buy Crypto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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

        {showPaymentIframe && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background/95 border border-white/10 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <h3 className="text-xl font-medium text-white">Payment Gateway</h3>
                <button 
                  onClick={() => setShowPaymentIframe(false)}
                  className="text-white/70 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <iframe 
                  src="https://pesapal-api-1.onrender.com/deposit" 
                  className="w-full h-full border-0"
                  title="Payment Gateway"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DepositPage;