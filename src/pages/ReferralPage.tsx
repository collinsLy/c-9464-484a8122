
import { useState, useEffect } from 'react';
import { Copy, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

const ReferralPage = () => {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLink, setReferralLink] = useState<string>('');
  const [referralCount, setReferralCount] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState<boolean>(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  const userId = localStorage.getItem('userId');

  // Generate or fetch referral code
  useEffect(() => {
    const generateReferralCode = async () => {
      if (!userId) return;
      
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists() && userSnap.data().referralCode) {
          setReferralCode(userSnap.data().referralCode);
        } else {
          // Generate a new referral code
          const newCode = `${userId.substring(0, 4)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          await updateDoc(userRef, {
            referralCode: newCode,
            referralCount: 0,
            totalReferralEarned: 0
          });
          setReferralCode(newCode);
        }
        
        // Subscribe to referral updates
        const unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setReferralCount(data.referralCount || 0);
            setTotalEarned(data.totalReferralEarned || 0);
            setProgress(Math.min((data.referralCount || 0) * 10, 100)); // Assuming 10 referrals = 100%
          }
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up referrals:", error);
        toast({
          title: "Error",
          description: "Failed to set up referral system",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    generateReferralCode();
  }, [userId, toast]);
  
  // Update referral link when code is available
  useEffect(() => {
    if (referralCode) {
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/signup?ref=${referralCode}`);
    }
  }, [referralCode]);
  
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };
  
  const handleInviteFriends = () => {
    setIsInviteDialogOpen(true);
  };
  
  const handleWithdrawRewards = async () => {
    if (progress < 100) {
      toast({
        title: "Not Available",
        description: "Withdrawal is available when the progress reaches 100%",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (!userId) return;
      
      // Add withdrawal logic here
      const userRef = doc(db, 'users', userId);
      
      // Create a withdrawal request
      const withdrawalRef = doc(db, 'withdrawalRequests', `${userId}_${Date.now()}`);
      await setDoc(withdrawalRef, {
        userId,
        amount: 2000, // USDC amount
        status: 'pending',
        timestamp: new Date(),
        type: 'referral'
      });
      
      // Reset referral progress
      await updateDoc(userRef, {
        referralCount: 0,
        pendingReferralWithdrawal: 2000
      });
      
      toast({
        title: "Success!",
        description: "Your withdrawal request has been submitted",
      });
      
      setProgress(0);
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal request",
        variant: "destructive"
      });
    }
  };

  const tasks = [
    { title: "Sign up", reward: 100, completed: true },
    { title: "Verify identity", reward: 200, completed: true },
    { title: "Make first deposit", reward: 500, completed: referralCount > 2 },
    { title: "Trade for 3 days", reward: 500, completed: referralCount > 5 },
    { title: "Refer 3 friends", reward: 700, completed: referralCount >= 10 }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Referral Program</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Your Referral Link</CardTitle>
              <CardDescription className="text-white/70">
                Share this link with friends to earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-white/5 p-3 rounded-lg flex-1 overflow-hidden truncate text-white">
                    {referralLink}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="bg-white/10 border-white/20 hover:bg-white/20"
                    onClick={copyReferralLink}
                  >
                    <Copy className="h-4 w-4 text-white" />
                  </Button>
                </div>
                
                <Button 
                  className="w-full bg-[#F2FF44] text-black hover:bg-[#F2FF44]/90 font-medium"
                  onClick={handleInviteFriends}
                >
                  Invite Friends
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/40 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Referral Stats</CardTitle>
              <CardDescription className="text-white/70">
                Track your referral progress and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white">Progress</span>
                  <span className="text-white">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/10" />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/70 text-sm">Total Referrals</p>
                    <p className="text-white text-2xl font-bold">{referralCount}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/70 text-sm">Total Earned</p>
                    <p className="text-white text-2xl font-bold">${totalEarned.toFixed(2)}</p>
                  </div>
                </div>
                
                <Button 
                  className={`w-full ${progress < 100 ? 'bg-yellow-600/50 hover:bg-yellow-600/70' : 'bg-yellow-500 hover:bg-yellow-600'} text-black font-medium`}
                  onClick={handleWithdrawRewards}
                >
                  Withdraw Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-background/40 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white">Referral Tasks</CardTitle>
            <CardDescription className="text-white/70">
              Complete these tasks to earn up to 2,000 USDC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${task.completed ? 'bg-green-500' : 'bg-white/20'}`}>
                      {task.completed && <Check className="h-4 w-4 text-black" />}
                    </div>
                    <span className="text-white">{task.title}</span>
                  </div>
                  <span className="text-white/80">+${task.reward} USDC</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Invite Friends Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">INVITE FRIENDS TO WIN BIG!</DialogTitle>
            <DialogDescription className="text-center text-white/70">
              Simply invite friends to complete tasks to earn up to 2,000 USDC!
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center my-4">
            <div className="relative">
              <div className="flex gap-2">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center rotate-[-15deg]">
                  <span className="text-white text-xl">$</span>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">$</span>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="text-3xl text-white opacity-20">+</div>
              </div>
              <div className="absolute bottom-0 right-0 w-full h-full flex items-center justify-center">
                <div className="text-3xl text-white opacity-20">×</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="bg-white/5 p-3 rounded-lg flex-1 overflow-hidden truncate text-white">
                {referralLink}
              </div>
              <Button 
                variant="outline" 
                size="icon"
                className="bg-white/10 border-white/20 hover:bg-white/20"
                onClick={copyReferralLink}
              >
                <Copy className="h-4 w-4 text-white" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=Join%20me%20on%20Vertex%20Trading%20and%20earn%20crypto%20rewards!%20Sign%20up%20using%20my%20referral%20link:%20${encodeURIComponent(referralLink)}`, '_blank');
                }}
              >
                Share on Twitter
              </Button>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  window.open(`https://wa.me/?text=Join%20me%20on%20Vertex%20Trading%20and%20earn%20crypto%20rewards!%20Sign%20up%20using%20my%20referral%20link:%20${encodeURIComponent(referralLink)}`, '_blank');
                }}
              >
                Share on WhatsApp
              </Button>
            </div>
            
            <Button 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
              onClick={() => setIsInviteDialogOpen(false)}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">WITHDRAW</DialogTitle>
            <DialogDescription className="text-center text-white/70">
              Withdraw is available when the progress reaches 100%
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center my-4">
            <div className="relative">
              <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">$</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="flex justify-between">
              <span className="text-white">Progress</span>
              <span className="text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10" />
            
            <Button 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
              onClick={handleInviteFriends}
            >
              Invite Friends
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ReferralPage;
