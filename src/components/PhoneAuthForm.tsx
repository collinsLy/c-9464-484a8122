import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  PhoneAuthProvider 
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { UserService } from '@/lib/firebase-service';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Added DialogTitle import


const phoneFormSchema = z.object({
  phoneNumber: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .regex(/^\+?[0-9\s\-\(\)]+$/, "Please enter a valid phone number")
    .refine((val) => {
      // Remove formatting characters to check the actual digit count
      const digitsOnly = val.replace(/[^\d]/g, '');
      return digitsOnly.length >= 8 && digitsOnly.length <= 15;
    }, "Phone number must be between 8 and 15 digits")
});

const verificationFormSchema = z.object({
  verificationCode: z
    .string()
    .length(6, "Verification code must be 6 digits")
});

interface PhoneAuthFormProps {
  onSuccess: () => void;
}

const PhoneAuthForm = ({ onSuccess }: PhoneAuthFormProps) => {
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationId, setVerificationId] = useState("");
  const { toast } = useToast();

  // Initialize reCAPTCHA once when component loads
  const setupRecaptcha = () => {
    try {
      // Clear any existing recaptcha to prevent duplicates
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        delete (window as any).recaptchaVerifier;
      }
      
      // Get the recaptcha container element
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
        throw new Error('Recaptcha container not found');
      }
      
      // Clear the container
      recaptchaContainer.innerHTML = '';
      
      // Create a new recaptcha verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber
          phoneForm.handleSubmit(onSubmitPhone)();
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          toast({
            title: "reCAPTCHA expired",
            description: "Please solve the reCAPTCHA again",
            variant: "destructive"
          });
        }
      });
      
      (window as any).recaptchaVerifier = recaptchaVerifier;
      return recaptchaVerifier;
    } catch (error) {
      console.error("Error setting up reCAPTCHA:", error);
      toast({
        title: "reCAPTCHA Error",
        description: "Failed to initialize verification. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phoneNumber: ""
    }
  });

  const verificationForm = useForm<z.infer<typeof verificationFormSchema>>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      verificationCode: ""
    }
  });

  const onSubmitPhone = async (values: z.infer<typeof phoneFormSchema>) => {
    setIsSubmittingPhone(true);

    try {
      // Format phone number to E.164 format (required by Firebase)
      let formattedPhone = values.phoneNumber.trim();
      // Make sure it starts with +
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      // Remove any spaces, dashes, or parentheses
      formattedPhone = formattedPhone.replace(/[\s\-\(\)]/g, '');
      
      console.log("Sending verification to:", formattedPhone);
      
      // Set up recaptcha verifier
      const recaptchaVerifier = setupRecaptcha();
      if (!recaptchaVerifier) {
        throw new Error("Failed to initialize reCAPTCHA");
      }
      
      // Send the verification code
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        recaptchaVerifier
      );

      // If successful, store the verification ID and show the verification form
      setVerificationId(confirmationResult.verificationId);
      setShowVerificationForm(true);

      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code",
      });
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      
      // Show specific error messages based on the error code
      if (error.code === 'auth/invalid-phone-number') {
        phoneForm.setError("phoneNumber", { 
          message: "Invalid phone number format. Please use international format (e.g., +1234567890)" 
        });
      } else if (error.code === 'auth/too-many-requests') {
        toast({
          title: "Too many attempts",
          description: "Please try again later",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send verification code",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmittingPhone(false);
    }
  };

  const onSubmitVerification = async (values: z.infer<typeof verificationFormSchema>) => {
    setIsSubmittingVerification(true);

    try {
      if (!verificationId) {
        throw new Error("Verification session expired. Please try again.");
      }
      
      // Create credential from verification ID and code
      const credential = PhoneAuthProvider.credential(
        verificationId, 
        values.verificationCode
      );

      // Sign in with credential
      const userCredential = await auth.signInWithCredential(credential);
      const user = userCredential.user;
      
      console.log("Successfully authenticated phone number:", user.phoneNumber);

      // Store user ID in localStorage
      localStorage.setItem('userId', user.uid);
      
      // Import UserService to access getUserData and createUser methods
      const { UserService } = await import('@/lib/firebase-service');

      // Check if user exists in database
      const userData = await UserService.getUserData(user.uid);

      // If user doesn't exist, create a new profile
      if (!userData) {
        console.log("Creating new user profile for phone authentication");
        await UserService.createUser(user.uid, {
          fullName: user.displayName || "Phone User",
          email: user.email || "",
          phone: user.phoneNumber || "",
          balance: 0,
          profilePhoto: user.photoURL || ""
        });
      } else {
        console.log("User already exists in database");
        // Update phone number if it changed
        if (userData.phone !== user.phoneNumber) {
          await UserService.updateUserData(user.uid, {
            phone: user.phoneNumber
          });
        }
      }

      toast({
        title: "Successfully signed in",
        description: "Welcome back to your account",
      });

      onSuccess();
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Error verifying code:", error);

      if (error.code === 'auth/invalid-verification-code') {
        verificationForm.setError("verificationCode", { 
          message: "Invalid verification code" 
        });
      } else if (error.code === 'auth/code-expired') {
        verificationForm.setError("verificationCode", { 
          message: "Verification code expired" 
        });
        toast({
          title: "Code expired",
          description: "Please request a new verification code",
          variant: "destructive"
        });
        setShowVerificationForm(false);
      } else {
        toast({
          title: "Verification failed",
          description: error.message || "Invalid verification code",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showVerificationForm ? (
        <>
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} className="space-y-6">
              <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div id="recaptcha-container" className="my-4"></div>

              <Button type="submit" className="w-full" disabled={isSubmittingPhone}>
                {isSubmittingPhone ? "Sending Code..." : "Send Verification Code"}
              </Button>
            </form>
          </Form>
        </>
      ) : (
        <>
          <Form {...verificationForm}>
            <form onSubmit={verificationForm.handleSubmit(onSubmitVerification)} className="space-y-6">
              <FormField
                control={verificationForm.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmittingVerification}>
                {isSubmittingVerification ? "Verifying..." : "Verify Code"}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => setShowVerificationForm(false)}
              >
                Back
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
};

export default PhoneAuthForm;