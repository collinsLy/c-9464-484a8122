import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDashboardContext } from '@/components/dashboard/DashboardLayout';
import { useToast } from "@/components/ui/use-toast";
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { VisaIcon, MastercardIcon, PayPalIcon, BankIcon, MpesaIcon, AirtelMoneyIcon } from '@/assets/payment-icons';
import { cn } from '@/lib/utils';
import { networkAddresses } from '@/lib/network-addresses';
import UidTransfer from "@/components/dashboard/UidTransfer";
import QRCodeScanner from '@/components/QRCodeScanner';
import { auth } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { UserService } from '@/lib/user-service';


const DepositPage = () => {
  const { isDemoMode } = useDashboardContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("crypto");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState('NATIVE');
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showAllCoinsDialog, setShowAllCoinsDialog] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [fetchUserBalance, setFetchUserBalance] = useState(0);
  const [kshAmount, setKshAmount] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const conversionRate = 135;

  // Generate unique reference number
  const generateReferenceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `DEP${timestamp}${random}`;
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const currentAuth = getAuth();
      if (currentAuth.currentUser) {
        try {
          const data = await UserService.getUserData(currentAuth.currentUser.uid);
          console.log('Fetched user data:', data); // Debug log
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData();
      }
    });

    // Initial fetch if user is already logged in
    if (auth.currentUser) {
      fetchUserData();
    }

    return () => unsubscribe();
  }, []);

  // No longer generating reference in useEffect - moved to button click handler

  // Build PayHero checkout URL with parameters
  const getPayHeroUrl = () => {
    const baseUrl = "https://app.payhero.co.ke/lipwa/1981";
    const params = new URLSearchParams({
      amount: isDemoMode ? '0' : Math.round(kshAmount).toString(),
      reference: referenceNumber || '',
      name: userData?.fullName || userData?.name || 'Guest User',
      email: userData?.email || '',
    });
    return `${baseUrl}?${params.toString()}`;
  };

  // Handler for QR code scanning results
  const handleScanResult = (result: string) => {
    toast({
      title: "QR Code Scanned",
      description: "Successfully scanned QR code",
    });

    // Process the scanned result
    if (result.startsWith('bitcoin:')) {
      // Extract Bitcoin address from URI
      const addressMatch = result.match(/bitcoin:([a-zA-Z0-9]+)/);
      if (addressMatch && addressMatch[1]) {
        const address = addressMatch[1];
        setSelectedCrypto('BTC');
        setNetwork('NATIVE');
        // In a real app, you'd update the deposit address state here
        toast({
          title: "Bitcoin Address Detected",
          description: `Address: ${address.substring(0, 10)}...`,
        });
      }
    } else if (result.includes('ethereum:')) {
      setSelectedCrypto('ETH');
      setNetwork('ERC20');
    } else {
      // Handle other formats or unknown QR codes
      toast({
        title: "Unknown QR Format",
        description: "The scanned QR code format is not recognized",
        variant: "destructive"
      });
    }
  };

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
      <div className="w-full space-y-4 sm:space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">Deposit Funds</h1>
            <p className="text-sm text-white/70 mt-1 break-words">Deposit funds securely to your account</p>
          </div>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md whitespace-nowrap">Demo Mode</div>}
        </div>

        <Card className="w-full bg-background/40 backdrop-blur-lg border-white/10 text-white">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl break-words">Deposit Options</CardTitle>
            <CardDescription className="text-white/70 break-words">
              Choose your preferred deposit method
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Display only important coins in first row */}
                        {[
                          { symbol: 'BTC', name: 'Bitcoin', chainColor: '#F7931A' },
                          { symbol: 'ETH', name: 'Ethereum', chainColor: '#627EEA' },
                          { symbol: 'USDT', name: 'Tether', chainColor: '#26A17B' },
                        ].map((crypto) => (
                          <div
                            key={crypto.symbol}
                            className="relative group cursor-pointer"
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
                              <div className="relative w-8 h-8">
                                <img
                                  src={crypto.symbol === 'WLD' 
                                    ? "https://cryptologos.cc/logos/worldcoin-org-wld-logo.svg?v=040" 
                                    : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`}
                                  alt={crypto.symbol}
                                  className="w-full h-full"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                                  }}
                                />
                                {selectedCrypto === crypto.symbol && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#F2FF44] rounded-full">
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
                                <div className="font-semibold text-white">
                                  {crypto.symbol}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button 
                        onClick={() => {
                          setShowAllCoinsDialog(true);
                        }} 
                        className="mt-4 w-full bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] h-12 text-lg"
                      >
                        See All Cryptocurrencies
                      </Button>
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
                            <Button 
                              variant={network === 'CELO' ? 'secondary' : 'outline'}
                              onClick={() => setNetwork('CELO')}
                            >
                              CELO Network
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
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-white/10 hover:bg-white/10"
                            onClick={() => setShowScanner(true)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                              <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                              <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                              <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                              <rect width="7" height="7" x="7" y="7" rx="1"></rect>
                            </svg>
                            Scan
                          </Button>
                          <Button 
                            variant="secondary"
                            size="sm"
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
                    </div>
                    <div className="text-sm text-white/70 mt-6 p-4 bg-white/5 rounded-lg">
                      <p className="mb-2">Important Notes:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Send only {selectedCrypto} to this address</li>
                        <li>Deposits will be credited after {selectedCrypto === 'BTC' ? '2' : '12'} network confirmations</li>
                        <li>Please double-check the address before sending</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fiat">
                <div className="space-y-6">
                  {/* Fiat Deposit Notice */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-red-400 font-semibold mb-2">🚫 Notice: Fiat Deposits Temporarily Unavailable</h3>
                        <div className="text-white/90 space-y-2 text-sm">
                          <p>We're currently experiencing issues with fiat (flat) deposit methods.</p>
                          <p className="font-medium">Fiat deposits are temporarily unavailable at this time.</p>
                          <p>If you'd like to fund your account, please use crypto deposits instead—they're fully operational and instant.</p>
                          <p className="text-[#F2FF44]">We'll notify you as soon as fiat deposit options are back online. Thanks for your patience and understanding!</p>
                          <p className="text-white/70 text-xs">– The Vertex Trading Team</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-6">
                    <div className="grid gap-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-white text-lg">Select Payment Method</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/10 hover:bg-white/10"
                          onClick={() => setShowScanner(true)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                            <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                            <rect width="7" height="7" x="7" y="7" rx="1"></rect>
                          </svg>
                          Scan Payment QR
                        </Button>
                      </div>
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
                            const usdValue = parseFloat(e.target.value);
                            setAmount(e.target.value);
                            setKshAmount(isNaN(usdValue) ? 0 : usdValue * conversionRate);
                          }}
                          placeholder="0.00"
                          className="bg-background/40 border-white/10 text-white placeholder:text-white/50 pr-16 text-lg"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-white/70 text-lg">USD</span>
                        </div>
                      </div>
                      {kshAmount > 0 && (
                        <p className="text-white/70 text-sm">
                          Equivalent in KSH: {kshAmount.toFixed(2)}
                        </p>
                      )}

                    </div>
                    <Button 
                      className="w-full bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] h-12 text-lg"
                      disabled={!amount || parseFloat(amount) <= 0}
                      onClick={async () => {
                        // Generate reference number first
                        const newReference = generateReferenceNumber();
                        setReferenceNumber(newReference);
                        
                        // Ensure user data is loaded before showing payment iframe
                        if (!userData && auth.currentUser) {
                          try {
                            const data = await UserService.getUserData(auth.currentUser.uid);
                            setUserData(data);
                          } catch (error) {
                            console.error('Error fetching user data:', error);
                          }
                        }
                        setIsIframeLoading(true);
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
                        <li>Maximum single deposit: $10,000.00 (KSH 1,350,000.00)</li>
                        <li>Exchange rate: 1 USD = 135 KSH (fixed rate)</li>
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
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4">
            <div className="bg-gradient-to-br from-[#0f1115] to-[#1a1d23] border-0 sm:border border-[#F2FF44]/20 rounded-none sm:rounded-2xl w-full h-full sm:h-[90vh] sm:max-w-6xl flex flex-col shadow-2xl shadow-[#F2FF44]/10">
              {/* Responsive Header */}
              <div className="flex justify-between items-center p-3 sm:p-6 border-b border-[#F2FF44]/10 bg-gradient-to-r from-[#F2FF44]/5 to-transparent shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-[#F2FF44] rounded-full blur-sm opacity-20"></div>
                    <img src="/favicon.svg" alt="Vertex Logo" className="relative w-6 h-6 sm:w-8 sm:h-8 filter brightness-110" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white tracking-tight truncate">Vertex Deposit Checkpoint</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  {referenceNumber && (
                    <div className="bg-[#F2FF44]/10 px-2 py-1 sm:px-3 rounded-lg border border-[#F2FF44]/20 hidden sm:block">
                      <p className="text-xs text-[#F2FF44] font-mono">REF: {referenceNumber}</p>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      setShowPaymentIframe(false);
                      setIsIframeLoading(true);
                      setReferenceNumber("");
                    }}
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                    data-testid="button-close-payment"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Reference Number for Mobile - Below Header */}
              {referenceNumber && (
                <div className="sm:hidden bg-[#F2FF44]/10 px-3 py-2 border-b border-[#F2FF44]/10">
                  <p className="text-xs text-[#F2FF44] font-mono text-center">REF: {referenceNumber}</p>
                </div>
              )}

              {/* Content Area - Flexible and Scrollable */}
              <div className="flex-1 overflow-hidden relative min-h-0">
                {isIframeLoading && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0f1115] via-[#1a1d23] to-[#0f1115] flex flex-col items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative flex flex-col items-center">
                        <div className="relative">
                          <div className="absolute inset-0 w-16 h-16 sm:w-24 sm:h-24 border-4 border-[#F2FF44]/20 border-t-[#F2FF44] rounded-full animate-spin"></div>
                          <div className="absolute inset-2 w-12 h-12 sm:w-20 sm:h-20 border-2 border-[#F2FF44]/30 border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                          <div className="absolute inset-0 w-16 h-16 sm:w-24 sm:h-24 bg-[#F2FF44]/10 rounded-full blur-xl animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="bg-[#F2FF44]/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#F2FF44]/20">
                        <p className="text-[#F2FF44] text-xs sm:text-sm font-medium">🔒 SSL Encrypted Connection</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PayHero Checkout Iframe - Loads immediately */}
                <iframe
                  src={getPayHeroUrl()}
                  className="w-full h-full border-0"
                  title="PayHero Checkout"
                  allow="payment"
                  onLoad={() => {
                    setIsIframeLoading(false);
                  }}
                  style={{
                    WebkitOverflowScrolling: 'touch'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* QR Code Scanner */}
        <QRCodeScanner 
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleScanResult}
        />

        {/* Show All Coins Dialog */}
        <Dialog open={showAllCoinsDialog} onOpenChange={setShowAllCoinsDialog}>
          <DialogContent className="bg-background/95 backdrop-blur-lg border-white/10 text-white p-6">
            <h2 className="text-xl font-medium mb-4">All Cryptocurrencies</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                <button
                  key={crypto.symbol}
                  onClick={() => {
                    setSelectedCrypto(crypto.symbol);
                    setShowAllCoinsDialog(false);
                  }}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-white/10 hover:border-white/20 bg-background/40"
                >
                  <img
                    src={crypto.symbol === 'WLD'
                      ? "https://cryptologos.cc/logos/worldcoin-org-wld-logo.svg?v=040"
                      : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`}
                    alt={crypto.symbol}
                    className="w-7 h-7"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/generic.svg";
                    }}
                  />
                  <span className="mt-2 text-white text-sm">{crypto.symbol}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DepositPage;