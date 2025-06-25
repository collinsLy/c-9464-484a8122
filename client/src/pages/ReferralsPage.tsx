
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
