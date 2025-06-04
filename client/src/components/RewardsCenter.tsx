import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, Lock, Gift, Users, BookOpen, CreditCard } from "lucide-react";

export function RewardsCenter() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  // Task completion states (in a real app, these would come from a backend)
  const [tasks, setTasks] = useState({
    accountInfo: { completed: false, reward: 2 },
    advancedLearning: { completed: false, reward: 2 },
    spotDeposit: { completed: false, reward: 5 },
  });

  // Calculate total rewards and completion percentage
  const totalRewards = Object.values(tasks).reduce((sum, task) => sum + task.reward, 0);
  const earnedRewards = Object.entries(tasks)
    .filter(([_, task]) => task.completed)
    .reduce((sum, [_, task]) => sum + task.reward, 0);

  const completionPercentage = Object.keys(tasks).length > 0
    ? (Object.values(tasks).filter(task => task.completed).length / Object.keys(tasks).length) * 100
    : 0;

  // Mock login handler
  const handleLogin = () => {
    setUserLoggedIn(true);
  };

  // Mock task completion handler
  const completeTask = (taskId: string) => {
    setTasks(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        completed: true
      }
    }));
  };

  return (
    <Card className="bg-background/95 backdrop-blur-lg border-white/10 text-white shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Gift className="h-5 w-5 mr-2 text-accent" />
          Rewards Center
        </CardTitle>
        <CardDescription className="text-white/70">
          Complete simple tasks, claim your exclusive rewards with ease.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">New User Rewards</h3>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
              {earnedRewards}/{totalRewards} USDT
            </Badge>
          </div>

          <Progress value={completionPercentage} indicatorClassName="bg-accent" />

          <p className="text-sm text-white/70">Complete tasks to earn up to {totalRewards} USDT in rewards</p>
        </div>

        <div className="pt-2">
          <h3 className="font-medium mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2 text-white/70" />
            Share with friends
          </h3>

          {/* Task List */}
          <div className="space-y-3">
            {/* Task 1 */}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {tasks.accountInfo.completed ? 
                      <CheckCircle className="h-5 w-5 text-green-500" /> : 
                      <Clock className="h-5 w-5 text-white/50" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Complete Account Information</h4>
                    <p className="text-xs text-white/70 mt-1">Complete KYC verification and bind your phone number and email.</p>
                  </div>
                </div>
                <Badge className="bg-accent text-white border-none">
                  {tasks.accountInfo.reward} USDT
                </Badge>
              </div>
              <div className="mt-3 flex justify-end">
                {userLoggedIn ? (
                  <Button 
                    size="sm" 
                    variant={tasks.accountInfo.completed ? "outline" : "default"}
                    className={tasks.accountInfo.completed ? "border-green-500/50 text-green-500" : ""}
                    onClick={() => completeTask('accountInfo')}
                    disabled={tasks.accountInfo.completed}
                  >
                    {tasks.accountInfo.completed ? "Completed" : "Complete Task"}
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleLogin}>Log in</Button>
                )}
              </div>
            </div>

            {/* Task 2 */}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {tasks.advancedLearning.completed ? 
                      <CheckCircle className="h-5 w-5 text-green-500" /> : 
                      <BookOpen className="h-5 w-5 text-white/50" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Advanced Learning - Futures Trading</h4>
                    <p className="text-xs text-white/70 mt-1">Complete the following guide tutorials to further understand and master futures knowledge.</p>
                  </div>
                </div>
                <Badge className="bg-accent text-white border-none">
                  {tasks.advancedLearning.reward} USDT
                </Badge>
              </div>
              <div className="mt-3 flex justify-end">
                {userLoggedIn ? (
                  <Button 
                    size="sm" 
                    variant={tasks.advancedLearning.completed ? "outline" : "default"}
                    className={tasks.advancedLearning.completed ? "border-green-500/50 text-green-500" : ""}
                    onClick={() => completeTask('advancedLearning')}
                    disabled={tasks.advancedLearning.completed}
                  >
                    {tasks.advancedLearning.completed ? "Completed" : "Complete Task"}
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleLogin}>Log in</Button>
                )}
              </div>
            </div>

            {/* Task 3 */}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {tasks.spotDeposit.completed ? 
                      <CheckCircle className="h-5 w-5 text-green-500" /> : 
                      <CreditCard className="h-5 w-5 text-white/50" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Spot Deposit</h4>
                    <p className="text-xs text-white/70 mt-1">Complete a single spot deposit of the specified cryptocurrency equivalent to more than 100 USDT.</p>
                  </div>
                </div>
                <Badge className="bg-accent text-white border-none">
                  {tasks.spotDeposit.reward} USDT
                </Badge>
              </div>
              <div className="mt-3 flex justify-end">
                {userLoggedIn ? (
                  <Button 
                    size="sm" 
                    variant={tasks.spotDeposit.completed ? "outline" : "default"}
                    className={tasks.spotDeposit.completed ? "border-green-500/50 text-green-500" : ""}
                    onClick={() => completeTask('spotDeposit')}
                    disabled={tasks.spotDeposit.completed}
                  >
                    {tasks.spotDeposit.completed ? "Completed" : "Complete Task"}
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleLogin}>Log in</Button>
                )}
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4 border-white/10 hover:bg-white/5">
            View all tasks
          </Button>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <p className="text-xs text-white/70">
          Rewards are subject to our terms and conditions. The Futures Bonus can only be used for futures trading and cannot be withdrawn. Valid for 7 days from issuance.
        </p>
      </CardFooter>
    </Card>
  );
}

export default RewardsCenter;