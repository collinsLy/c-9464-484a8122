
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Info, Check, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const rewardTasks = [
  {
    id: "kyc",
    title: "Complete Account Information",
    description: "Complete KYC verification and bind your phone number and email.",
    reward: "2 USDT",
    icon: "T",
    path: "/settings",
    progress: 0,
    completed: false
  },
  {
    id: "futures-learning",
    title: "Advanced Learning - Futures Trading",
    description: "Complete the following guide tutorials to further understand and master futures knowledge.",
    reward: "2 USDT",
    icon: "T",
    path: "/futures-markets",
    progress: 0,
    completed: false
  },
  {
    id: "spot-deposit",
    title: "Spot Deposit",
    description: "Complete a single spot deposit of the specified cryptocurrency equivalent to more than 100 USDT.",
    reward: "5 USDT",
    icon: "T",
    path: "/deposit",
    progress: 0,
    completed: false
  },
  {
    id: "spot-trading",
    title: "Spot Trading",
    description: "Complete a single spot trading volume of more than 200 USDT.",
    reward: "1 USDT",
    icon: "T",
    path: "/spot-trading",
    progress: 0,
    completed: false
  },
  {
    id: "futures-trading",
    title: "Futures Trading",
    description: "Complete a single futures trading volume of more than 2000 USDT.",
    reward: "2 USDT",
    icon: "T",
    path: "/futures-markets",
    progress: 0,
    completed: false
  },
  {
    id: "futures-tpsl",
    title: "Experience Futures TP/SL",
    description: "Successfully trigger a futures TP/SL order",
    reward: "5 USDT",
    icon: "T",
    path: "/futures-markets",
    progress: 0,
    completed: false
  },
];

const RewardsCenter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<typeof rewardTasks[0] | null>(null);
  const [tasks, setTasks] = useState(rewardTasks);
  const [referralLink, setReferralLink] = useState("https://vertex-trading.com/ref?code=VRTX85421");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Simulate loading task status from backend
  useEffect(() => {
    // In a real app, this would fetch from your backend
    const timeout = setTimeout(() => {
      setTasks(prev => prev.map(task => {
        // Randomly set some tasks to have progress
        const randomProgress = Math.floor(Math.random() * 100);
        return {
          ...task,
          progress: randomProgress,
          completed: randomProgress === 100
        };
      }));
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  const handleTaskClick = (task: typeof rewardTasks[0]) => {
    if (isAuthenticated) {
      navigate(task.path);
    } else {
      setSelectedTask(task);
      setTaskDetailsOpen(true);
    }
  };

  const handleShareClick = () => {
    setShareDialogOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast({
        title: "Referral link copied!",
        description: "Share it with friends to earn rewards",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLogin = () => {
    navigate("/sign-in");
  };

  const handleViewAllTasks = () => {
    if (isAuthenticated) {
      // Show all tasks
    } else {
      navigate("/sign-in");
    }
  };

  const playSuccessSound = () => {
    const audio = new Audio("/sounds/success.mp3");
    audio.play();
  };

  const claimReward = (taskId: string) => {
    // Simulate claiming reward
    playSuccessSound();
    toast({
      title: "Reward claimed!",
      description: `You have successfully claimed the reward for ${selectedTask?.title}`,
    });
    setTaskDetailsOpen(false);
  };

  // Calculate total rewards
  const totalRewards = tasks.reduce((sum, task) => {
    const rewardValue = parseFloat(task.reward.split(" ")[0]);
    return sum + rewardValue;
  }, 0);

  // Calculate completed rewards
  const completedRewards = tasks
    .filter(task => task.completed)
    .reduce((sum, task) => {
      const rewardValue = parseFloat(task.reward.split(" ")[0]);
      return sum + rewardValue;
    }, 0);

  return (
    <div className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5 backdrop-blur-3xl"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Rewards Center
            </h2>
            <p className="text-xl text-white/70">
              Complete simple tasks, claim your exclusive rewards with ease.
            </p>
            <div className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div>
                <h3 className="text-2xl font-semibold text-white">New User Rewards</h3>
                <p className="text-white/70">Complete tasks to earn up to {totalRewards} USDT in rewards</p>
                <div className="mt-2">
                  <Progress 
                    value={(completedRewards / totalRewards) * 100} 
                    className="h-2 bg-white/10" 
                    indicatorClassName="bg-[#F2FF44]" 
                  />
                  <div className="flex justify-between mt-1 text-xs text-white/70">
                    <span>{completedRewards.toFixed(2)} USDT earned</span>
                    <span>{totalRewards.toFixed(2)} USDT total</span>
                  </div>
                </div>
              </div>
              <Button 
                className="bg-white/10 hover:bg-white/20 text-white" 
                onClick={handleShareClick}
              >
                Share with friends <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="space-y-4 mt-8">
              {tasks.slice(0, 3).map((task, index) => (
                <Card 
                  key={index} 
                  className={`bg-background/40 backdrop-blur-lg border-white/10 p-4 hover:bg-white/5 transition-all ${task.completed ? 'border-green-500/30' : ''}`}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full ${task.completed ? 'bg-green-500/20' : 'bg-white/10'} flex items-center justify-center flex-shrink-0`}>
                      {task.completed ? (
                        <Check className="text-green-400 w-6 h-6" />
                      ) : (
                        <span className="text-2xl font-bold text-[#F2FF44]">{task.icon}</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                        {task.completed ? (
                          <Badge className="bg-green-500/20 text-green-400 border-0">Completed</Badge>
                        ) : (
                          <div className="px-3 py-1 rounded-full bg-white/5 text-sm text-white/70">
                            {task.progress > 0 ? `${task.progress}% completed` : 'To be completed'}
                          </div>
                        )}
                      </div>
                      <p className="text-white/70">{task.description}</p>
                      
                      {task.progress > 0 && !task.completed && (
                        <Progress 
                          value={task.progress} 
                          className="h-1.5 mt-2 bg-white/10" 
                          indicatorClassName="bg-[#F2FF44]" 
                        />
                      )}
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xl font-semibold text-[#F2FF44]">{task.reward}</span>
                        {task.completed ? (
                          <Button variant="outline" size="sm" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                            Claimed
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-white/20 hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLogin();
                            }}
                          >
                            {isAuthenticated ? (task.progress > 0 ? "Continue" : "Start") : "Log in"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full border-white/10 text-white hover:bg-white/10"
                onClick={handleViewAllTasks}
              >
                View all tasks
              </Button>

              <div className="text-xs text-white/50 flex items-start gap-2 mt-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Rewards are subject to our terms and conditions. The Futures Bonus can only be used for futures trading and cannot be withdrawn. Valid for 7 days from issuance.
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <img 
                src="/attached_assets/d5dd1c20-af26-4430-9eb4-3b78a53b74cf.png" 
                alt="Rewards Gift Box" 
                className="w-full max-w-md"
              />
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-background border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Share with Friends</DialogTitle>
            <DialogDescription className="text-white/70">
              Share your referral link and earn 10% of your friends' trading fees
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-white/5 p-3 rounded-lg flex items-center justify-between">
              <span className="text-sm truncate mr-2">{referralLink}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/10" 
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button className="bg-white/10 hover:bg-white/20 text-white w-full">
                <img src="/linkedin.svg" alt="LinkedIn" className="w-5 h-5 mr-2" />
                LinkedIn
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 text-white w-full">
                <img src="/twitter.svg" alt="Twitter" className="w-5 h-5 mr-2" />
                Twitter
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 text-white w-full">
                <img src="/facebook.svg" alt="Facebook" className="w-5 h-5 mr-2" />
                Facebook
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 text-white w-full">
                <img src="/telegram.svg" alt="Telegram" className="w-5 h-5 mr-2" />
                Telegram
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={taskDetailsOpen} onOpenChange={setTaskDetailsOpen}>
        <DialogContent className="bg-background border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription className="text-white/70">
              {selectedTask?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Reward</span>
                <span className="text-xl font-semibold text-[#F2FF44]">{selectedTask?.reward}</span>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-white/70 mb-2">Progress</p>
                <Progress 
                  value={selectedTask?.progress || 0} 
                  className="h-2 bg-white/10" 
                  indicatorClassName="bg-[#F2FF44]" 
                />
                <div className="flex justify-between mt-1 text-xs text-white/70">
                  <span>{selectedTask?.progress || 0}% completed</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="w-full bg-white/10 hover:bg-white/20 text-white"
                onClick={handleLogin}
              >
                Log in to Continue
              </Button>
              
              {selectedTask?.progress === 100 && (
                <Button 
                  className="w-full bg-[#F2FF44] text-black hover:bg-[#E1EE33]"
                  onClick={() => selectedTask && claimReward(selectedTask.id)}
                >
                  Claim Reward
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardsCenter;
