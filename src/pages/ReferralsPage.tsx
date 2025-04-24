import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ReferralsPage = () => {
  const [referralCode, setReferralCode] = useState("TRADE2024");
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    setReferralLink(`${window.location.origin}?ref=${referralCode}`);
  }, [referralCode]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Referral Program</h2>
          <p className="text-white/70 mt-2">Invite friends and earn rewards together</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="bg-background/40 border-white/10 text-white"
                />
                <Button onClick={() => copyToClipboard(referralLink)}>Copy</Button>
              </div>
              <p className="text-sm text-white/70">Share this link with your friends</p>
            </CardContent>
          </Card>

          <Card className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-white">
                <div className="flex items-center justify-between">
                  <span>Total Referrals</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Earnings</span>
                  <span className="font-bold">$0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-background/40 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">How it Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-semibold text-white">1. Share Your Link</h3>
                <p className="text-sm text-white/70">Share your unique referral link with friends</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">2. Friends Join</h3>
                <p className="text-sm text-white/70">When they sign up using your link</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">3. Earn Rewards</h3>
                <p className="text-sm text-white/70">Get 10% of their trading fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReferralsPage;
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserService } from "@/lib/user-service";
import { useToast } from "@/components/ui/use-toast";
import { Users, Gift, Send, Clock, ArrowRight } from "lucide-react";

const ReferralsPage2 = () => {
  const [recipientUid, setRecipientUid] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const currentUserId = UserService.getCurrentUserId();

  const handleTransfer = async () => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You must be logged in to transfer funds",
        variant: "destructive"
      });
      return;
    }

    if (!recipientUid) {
      toast({
        title: "Error",
        description: "Please enter a recipient UID",
        variant: "destructive"
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      await UserService.transferFunds(currentUserId, recipientUid, transferAmount);

      toast({
        title: "Success",
        description: `Successfully transferred ${transferAmount} to user ${recipientUid}`,
      });

      // Reset form
      setRecipientUid("");
      setAmount("");
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "An error occurred during the transfer",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Referrals & Transfers</h1>
            <p className="text-muted-foreground">Share your UID or transfer funds to other users</p>
          </div>
        </div>

        <Tabs defaultValue="transfer" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="transfer">Send Funds</TabsTrigger>
            <TabsTrigger value="referral">Referral Program</TabsTrigger>
          </TabsList>

          <TabsContent value="transfer" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Transfer Funds
                </CardTitle>
                <CardDescription>
                  Send funds directly to another user using their UID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientUid">Recipient UID</Label>
                  <Input
                    id="recipientUid"
                    placeholder="Enter recipient's UID"
                    value={recipientUid}
                    onChange={(e) => setRecipientUid(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount to transfer"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full mt-4" 
                  onClick={handleTransfer}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Transfer Funds"}
                </Button>

                <div className="bg-muted p-3 rounded-md mt-4 text-sm">
                  <p className="font-medium mb-2">Your UID: {currentUserId}</p>
                  <p>Share this UID with others who want to send you funds.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Referral Program
                </CardTitle>
                <CardDescription>
                  Invite friends and earn rewards when they sign up and trade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/20">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Gift className="mr-2 h-5 w-5 text-blue-400" />
                    Earn Rewards
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/20 rounded-full p-2 mt-1">
                        <ArrowRight className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">10% Commission</p>
                        <p className="text-sm text-muted-foreground">On all trading fees generated by your referrals</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500/20 rounded-full p-2 mt-1">
                        <Clock className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">Lifetime Rewards</p>
                        <p className="text-sm text-muted-foreground">Earn from your referrals for as long as they trade</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Your Referral UID</Label>
                  <div className="flex">
                    <Input value={currentUserId || "Log in to get your UID"} readOnly />
                    <Button 
                      variant="outline" 
                      className="ml-2"
                      onClick={() => {
                        navigator.clipboard.writeText(currentUserId || "");
                        toast({
                          title: "Copied!",
                          description: "UID copied to clipboard"
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Share this UID with others to earn referral rewards</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReferralsPage2;