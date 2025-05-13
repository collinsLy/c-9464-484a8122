
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Info } from "lucide-react";

const rewardTasks = [
  {
    title: "Complete Account Information",
    description: "Complete KYC verification and bind your phone number and email.",
    reward: "2 USDT",
    icon: "T"
  },
  {
    title: "Advanced Learning - Futures Trading",
    description: "Complete the following guide tutorials to further understand and master futures knowledge.",
    reward: "2 USDT",
    icon: "T"
  },
  {
    title: "Spot Deposit",
    description: "Complete a single spot deposit of the specified cryptocurrency equivalent to more than 100 USDT.",
    reward: "5 USDT",
    icon: "T"
  },
  {
    title: "Spot Trading",
    description: "Complete a single spot trading volume of more than 200 USDT.",
    reward: "1 USDT",
    icon: "T"
  },
  {
    title: "Futures Trading",
    description: "Complete a single futures trading volume of more than 2000 USDT.",
    reward: "2 USDT",
    icon: "T"
  },
  {
    title: "Experience Futures TP/SL",
    description: "Successfully trigger a futures TP/SL order",
    reward: "5 USDT",
    icon: "T"
  },
];

const RewardsCenter = () => {
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
                <p className="text-white/70">Complete tasks to earn up to 19 USDT in rewards</p>
              </div>
              <Button className="bg-white/10 hover:bg-white/20 text-white">
                Share with friends <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="space-y-4 mt-8">
              {rewardTasks.slice(0, 3).map((task, index) => (
                <Card key={index} className="bg-background/40 backdrop-blur-lg border-white/10 p-4 hover:bg-white/5 transition-all">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-[#F2FF44]">{task.icon}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                        <div className="px-3 py-1 rounded-full bg-white/5 text-sm text-white/70">To be completed</div>
                      </div>
                      <p className="text-white/70">{task.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xl font-semibold text-[#F2FF44]">{task.reward}</span>
                        <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                          Log in
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10">
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
    </div>
  );
};

export default RewardsCenter;
