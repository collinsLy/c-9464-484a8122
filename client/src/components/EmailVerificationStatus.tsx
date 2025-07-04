
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/lib/firebase";
import { sendEmailVerification, reload } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EmailVerificationStatus() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (auth.currentUser) {
        await reload(auth.currentUser);
        setIsVerified(auth.currentUser.emailVerified);
        setShowVerificationAlert(!auth.currentUser.emailVerified);
      }
    };

    checkVerificationStatus();
    
    // Check verification status every 10 seconds
    const interval = setInterval(checkVerificationStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;

    setIsLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
      });
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified || !showVerificationAlert) {
    return null;
  }

  return (
    <Alert className="mb-4 border-yellow-500 bg-yellow-50 text-yellow-800">
      <AlertDescription className="flex items-center justify-between">
        <span>Please verify your email address to access all features.</span>
        <Button
          onClick={handleResendVerification}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="ml-4"
        >
          {isLoading ? "Sending..." : "Resend Email"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
