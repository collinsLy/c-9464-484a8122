import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDashboardContext } from '@/components/dashboard/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const WithdrawPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [activeTab, setActiveTab] = useState("crypto");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  
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
                <div className="space-y-6">
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label className="text-white">Select Cryptocurrency</Label>
                      <select
                        value={selectedCrypto}
                        onChange={(e) => setSelectedCrypto(e.target.value)}
                        className="bg-background/40 text-white border border-white/10 rounded-md p-2 w-full"
                      >
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="USDT">Tether (USDT)</option>
                        <option value="BNB">BNB</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-white">Wallet Address</Label>
                      <Input
                        type="text"
                        placeholder="Enter your wallet address"
                        className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-white">Amount</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="bg-background/40 border-white/10 text-white placeholder:text-white/50 pr-16"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-white/70">{selectedCrypto}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]">
                      {isDemoMode ? "Demo Withdraw" : "Withdraw"}
                    </Button>
                  </div>
                  <div className="text-sm text-white/70 mt-6 p-4 bg-white/5 rounded-lg">
                    <p className="mb-2">Important Notes:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Withdrawals may take up to 24 hours to process</li>
                      <li>Double-check the wallet address before confirming</li>
                      <li>Minimum withdrawal amount: 0.001 {selectedCrypto}</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="fiat">
                <div className="space-y-6">
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label className="text-white">Bank Account Name</Label>
                      <Input
                        type="text"
                        placeholder="Enter bank account name"
                        className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-white">Bank Account Number</Label>
                      <Input
                        type="text"
                        placeholder="Enter bank account number"
                        className="bg-background/40 border-white/10 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-white">Amount</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="bg-background/40 border-white/10 text-white placeholder:text-white/50 pr-16"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-white/70">USD</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]">
                      {isDemoMode ? "Demo Withdraw" : "Withdraw"}
                    </Button>
                  </div>
                  <div className="text-sm text-white/70 mt-6 p-4 bg-white/5 rounded-lg">
                    <p className="mb-2">Important Notes:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Fiat withdrawals may take 2-5 business days to process</li>
                      <li>Verify your bank details before confirming</li>
                      <li>Minimum withdrawal amount: $50.00</li>
                      <li>Maximum withdrawal amount: $50,000.00 per day</li>
                    </ul>
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