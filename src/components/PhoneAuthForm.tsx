
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

const phoneFormSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[0-9\s\-\(\)]+$/, "Please enter a valid phone number")
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
    if (!(window as any).recaptchaVerifier) {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
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
    }
    
    return (window as any).recaptchaVerifier;
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
      const formattedPhone = values.phoneNumber.startsWith('+') 
        ? values.phoneNumber 
        : `+${values.phoneNumber}`;
      
      const recaptchaVerifier = setupRecaptcha();
      recaptchaVerifier.render();
      
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        recaptchaVerifier
      );
      
      setVerificationId(confirmationResult.verificationId);
      setShowVerificationForm(true);
      
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code",
      });
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingPhone(false);
    }
  };

  const onSubmitVerification = async (values: z.infer<typeof verificationFormSchema>) => {
    setIsSubmittingVerification(true);
    
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId, 
        values.verificationCode
      );
      
      const userCredential = await auth.signInWithCredential(credential);
      
      // Store user ID in localStorage
      localStorage.setItem('userId', userCredential.user.uid);
      
      // Check if user exists in database
      const userData = await UserService.getUserData(userCredential.user.uid);
      
      // If user doesn't exist, create a new profile
      if (!userData) {
        await UserService.createUser(userCredential.user.uid, {
          fullName: userCredential.user.displayName || "Phone User",
          email: userCredential.user.email || "",
          phone: userCredential.user.phoneNumber || "",
          balance: 0,
          profilePhoto: userCredential.user.photoURL || ""
        });
      }
      
      toast({
        title: "Successfully signed in",
        description: "Welcome back to your account",
      });
      
      onSuccess();
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Error verifying code:", error);
      
      verificationForm.setError("verificationCode", { 
        message: "Invalid verification code" 
      });
      
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code",
        variant: "destructive"
      });
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
