import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface PhoneAuthFormProps {
  onSuccess: () => void;
}

const PhoneAuthForm = ({ onSuccess }: PhoneAuthFormProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow sending verification code
        },
        'expired-callback': () => {
          // Reset reCAPTCHA
          toast({
            title: "reCAPTCHA expired",
            description: "Please solve the reCAPTCHA again",
            variant: "destructive"
          });
        }
      });
    }
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setupRecaptcha();

      // Format phone number with international code if not present
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+${phoneNumber}`;

      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhoneNumber,
        (window as any).recaptchaVerifier
      );

      setVerificationId(confirmationResult.verificationId);

      toast({
        title: "Verification Code Sent",
        description: "Please check your phone for the verification code"
      });
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || !verificationId) {
      toast({
        title: "Missing Code",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Import is done dynamically to prevent issues
      const { PhoneAuthProvider, signInWithCredential } = await import("firebase/auth");

      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );

      const result = await signInWithCredential(auth, credential);
      const user = result.user;

      // Store user ID and phone in localStorage
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('phone', user.phoneNumber || '');

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          fullName: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          balance: 0,
          profilePhoto: user.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Set flag to show welcome message
        localStorage.setItem('showWelcome', 'true');

        toast({
          title: "Account created",
          description: "Your account has been created successfully."
        });
      } else {
        toast({
          title: "Sign-in successful",
          description: "Welcome back to your account."
        });
      }

      // Allow time for toast to show before redirect
      setTimeout(() => {
        onSuccess();
        window.location.href = "/dashboard";
      }, 500);

    } catch (error: any) {
      console.error("Error verifying code:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify the code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      {!verificationId ? (
        <>
          <div className="space-y-2">
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number (with country code)"
              className="auth-input"
            />
            <div id="recaptcha-container"></div>
          </div>
          <Button 
            className="w-full auth-button" 
            onClick={sendVerificationCode}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
              className="auth-input"
            />
          </div>
          <Button 
            className="w-full auth-button" 
            onClick={verifyCode}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </>
      )}
    </div>
  );
};

export default PhoneAuthForm;