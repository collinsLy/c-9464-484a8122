import React from "react";
import { Button } from "@/components/ui/button";
import { useDashboardContext } from "./DashboardLayout";
import { Play, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore"; // Added Firebase import
// Assuming auth and db are defined elsewhere,  e.g., in a context provider.
//import { auth, db } from './firebase';  //Add this line if necessary


const DemoModeToggle = () => {
  const { isDemoMode, toggleDemoMode } = useDashboardContext();
  const { toast } = useToast();

  const handleToggle = async () => {
    try {
      await toggleDemoMode();
      const newBalance = isDemoMode ? "Real Balance" : "$10,000";
      toast({
        title: isDemoMode ? "Switched to Live Account" : "Switched to Demo Account",
        description: isDemoMode 
          ? "You are now trading with your real balance." 
          : "You are now practicing with $10,000 virtual funds.",
        variant: "default",
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch trading mode",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (isDemoMode) {
      try {
        // Reset demo balance in Firebase
        const userRef = doc(db, 'users', auth.currentUser?.uid || '');
        await updateDoc(userRef, {
          demoBalance: 10000
        });

        toast({
          title: "Demo Account Reset",
          description: "Your demo balance has been reset to $10,000.",
          variant: "default",
        });
        window.location.reload();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reset demo balance",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <Button 
        onClick={handleToggle}
        className={`w-full ${isDemoMode ? "bg-amber-500 hover:bg-amber-600" : "bg-accent hover:bg-accent/90"}`}
      >
        <Play className="mr-2 h-4 w-4" />
        {isDemoMode ? "Switch to Live Account" : "Demo Trading Mode"}
      </Button>

      {isDemoMode && (
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="w-full border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Demo Balance
        </Button>
      )}
    </div>
  );
};

export default DemoModeToggle;