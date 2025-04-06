import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDashboardContext } from '@/components/dashboard/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { VisaIcon, MastercardIcon, PayPalIcon, BankIcon, MpesaIcon, AirtelMoneyIcon } from '@/assets/payment-icons';
import { cn } from '@/lib/utils';

const DepositPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [activeTab, setActiveTab] = useState("crypto");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState('ERC20'); // Added network state

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: <div className="flex gap-2"><VisaIcon className="w-8 h-8" /><MastercardIcon className="w-8 h-8" /></div> },
    { id: "bank", name: "Bank Transfer", icon: <BankIcon className="w-8 h-8 text-white" /> },
    { id: "paypal", name: "PayPal", icon: <PayPalIcon className="w-8 h-8" /> },
    { id: "mpesa", name: "M-Pesa", icon: <MpesaIcon className="w-8 h-8" /> },
    { id: "airtel", name: "Airtel Money", icon: <AirtelMoneyIcon className="w-8 h-8" /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
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
                        <Button 
                          variant={selectedCrypto === 'USDT' ? 'secondary' : 'outline'}
                          onClick={() => setSelectedCrypto('USDT')}
                          className="flex items-center gap-2"
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/7/73/Tether_Logo.svg" alt="USDT" className="w-5 h-5" />
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
                          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Worldcoin_Logo.png" alt="WLD" className="w-5 h-5" />
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
                          <img src="https://cryptologos.cc/logos/solana-sol-logo.svg?v=040" alt="SOL" className="w-5 h-5" />
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
                        <Button 
                          variant={network === 'ERC20' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('ERC20')}
                        >
                          ERC20
                        </Button>
                        <Button 
                          variant={network === 'BEP20' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('BEP20')}
                        >
                          BEP20 (BSC)
                        </Button>
                        <Button 
                          variant={network === 'SOLANA' ? 'secondary' : 'outline'}
                          onClick={() => setNetwork('SOLANA')}
                        >
                          SOLANA
                        </Button>
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
                          value={`${selectedCrypto === 'BTC' ? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' : 
                                 selectedCrypto === 'ETH' ? '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' : 
                                 selectedCrypto === 'USDT' ? 'TRX7NB5Gku8bGxQRpwUTZPw9qBYvyVpwJD' : 
                                 selectedCrypto === 'BNB' ? '0xe5819dbd958be2e2113415abda3ebadf9855ee4c' :
                                 selectedCrypto === 'WLD' ? '0xe5819dbd958be2e2113415abda3ebadf9855ee4c' :
                                 selectedCrypto === 'USDC' ? (network === 'SOLANA' ? '7qKBhzgQQaDDYKjBPCKNkYVkppbTcpp5cpHhkqKheRtn' : '0xe5819dbd958be2e2113415abda3ebadf9855ee4c') :
                                 '0xe5819dbd958be2e2113415abda3ebadf9855ee4c'}`}
                          className="bg-background/40 border-white/10 text-white font-mono text-sm pr-24"
                        />
                        <Button 
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => navigator.clipboard.writeText(`${selectedCrypto === 'BTC' ? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' : 
                                                                        selectedCrypto === 'ETH' ? '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' : 
                                                                        selectedCrypto === 'USDT' ? 'TRX7NB5Gku8bGxQRpwUTZPw9qBYvyVpwJD' : 
                                                                        selectedCrypto === 'BNB' ? '0xe5819dbd958be2e2113415abda3ebadf9855ee4c' :
                                                                        selectedCrypto === 'WLD' ? '0xe5819dbd958be2e2113415abda3ebadf9855ee4c' :
                                                                        selectedCrypto === 'USDC' ? (network === 'SOLANA' ? '7qKBhzgQQaDDYKjBPCKNkYVkppbTcpp5cpHhkqKheRtn' : '0xe5819dbd958be2e2113415abda3ebadf9855ee4c') :
                                                                        '0xe5819dbd958be2e2113415abda3ebadf9855ee4c'}`)}
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