
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy } from "lucide-react";

interface BotWinTrackerProps {
  botId: string;
  userId: string;
}

// This is a client-side representation of the backend state
// In production, this would fetch from your backend API
const BotWinTracker = ({ botId, userId }: BotWinTrackerProps) => {
  const [winCount, setWinCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);

  const MAX_WINS = 7;
  const TIME_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    // Simulate fetching current session data from backend
    const fetchSessionData = async () => {
      try {
        // This would be replaced with an actual API call
        const mockSessionData = localStorage.getItem(`bot_session_${botId}`);
        if (mockSessionData) {
          const session = JSON.parse(mockSessionData);
          setWinCount(session.win_count);
          setStartTime(new Date(session.start_time));
          setIsActive(true);
        }
      } catch (error) {
        console.error("Error fetching bot session:", error);
      }
    };

    fetchSessionData();
  }, [botId, userId]);

  useEffect(() => {
    if (!startTime || !isActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - startTime.getTime();
      
      if (elapsed >= TIME_WINDOW_MS) {
        // Session has expired, reset
        setWinCount(0);
        setStartTime(null);
        setIsActive(false);
        localStorage.removeItem(`bot_session_${botId}`);
      } else {
        // Update remaining time
        setTimeRemaining(Math.max(0, TIME_WINDOW_MS - elapsed));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [botId, startTime, isActive]);

  // For demo purposes - in production, this would call your backend API
  const registerWin = () => {
    const now = new Date();
    
    if (!isActive) {
      // Start new session
      const newSession = {
        user_id: userId,
        bot_id: botId,
        win_count: 1,
        start_time: now.toISOString()
      };
      
      localStorage.setItem(`bot_session_${botId}`, JSON.stringify(newSession));
      setWinCount(1);
      setStartTime(now);
      setIsActive(true);
      return;
    }
    
    if (winCount >= MAX_WINS) {
      console.error("Win limit reached for this time window");
      return;
    }
    
    // Increment win count
    const updatedSession = {
      user_id: userId,
      bot_id: botId,
      win_count: winCount + 1,
      start_time: startTime?.toISOString()
    };
    
    localStorage.setItem(`bot_session_${botId}`, JSON.stringify(updatedSession));
    setWinCount(winCount + 1);
  };

  const formatTimeRemaining = () => {
    if (!timeRemaining) return "00:00";
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Trading Bot Limits</span>
          {isActive && (
            <Badge variant="outline" className="bg-white/5">
              <Clock className="h-3 w-3 mr-1" /> {formatTimeRemaining()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/70">Win Limit</span>
              <span className="font-mono text-[#F2FF44]">{winCount}/{MAX_WINS}</span>
            </div>
            <Progress value={(winCount / MAX_WINS) * 100} className="h-2 bg-white/10" indicatorClassName="bg-[#F2FF44]" />
          </div>
          
          <div className="text-xs text-white/70">
            {winCount >= MAX_WINS ? (
              <p className="text-amber-400">Maximum win limit reached. Limit resets in {formatTimeRemaining()}.</p>
            ) : isActive ? (
              <p>Each bot can register up to 7 wins within a 10-minute window.</p>
            ) : (
              <p>Start trading to activate your win session.</p>
            )}
          </div>
          
          {/* This button is just for demonstration purposes */}
          <div className="flex justify-center pt-2">
            <button 
              onClick={registerWin}
              className={`flex items-center px-3 py-1.5 rounded-md text-xs ${
                winCount >= MAX_WINS 
                  ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                  : 'bg-[#F2FF44]/20 text-[#F2FF44] hover:bg-[#F2FF44]/30'
              }`}
              disabled={winCount >= MAX_WINS}
            >
              <Trophy className="h-3 w-3 mr-1" /> 
              {winCount === 0 ? "Start Session" : "Simulate Win"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotWinTracker;
