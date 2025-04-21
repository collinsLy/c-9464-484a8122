import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, updatePassword, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import PhoneAuthForm from "./PhoneAuthForm";
import { Phone, Mail, LucideGithub } from "lucide-react";
import { useToast } from "./ui/use-toast";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

interface SignInFormProps {
  onSuccess: () => void;
}

const resetFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

import { useToast } from "@/components/ui/use-toast";

const SignInForm = ({ onSuccess }: SignInFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isPasswordUpdateRequired, setIsPasswordUpdateRequired] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [authMethod, setAuthMethod] = useState<"email" | "phone" | "google">("email");
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const { toast } = useToast();
  
  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    try {
      if (!auth || !db) {
        throw new Error('Firebase not initialized');
      }
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store user ID and email in localStorage
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('email', user.email || '');
      
      // Check if user exists in the database
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(doc(db, 'users', user.uid), {
          fullName: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          balance: 0,
          profilePhoto: user.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tradingHistory: [],
          activeStrategies: [],
          settings: {
            notifications: true,
            demoMode: false,
            theme: 'dark'
          }
        });
      }
      
      // Special account check
      if (user.email === 'kelvinkelly3189@gmail.com') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { balance: 72 });
      }
      
      onSuccess();
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Error with Google sign in:", error);
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "An error occurred during Google sign in.",
        variant: "destructive"
      });
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const resetForm = useForm<z.infer<typeof resetFormSchema>>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onResetPassword = async (values: z.infer<typeof resetFormSchema>) => {
    setIsResetting(true);
    try {
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }

      await sendPasswordResetEmail(auth, values.email);
      toast({
        title: "Reset link sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      switch (error.code) {
        case 'auth/user-not-found':
          resetForm.setError("email", { message: "No account found with this email" });
          break;
        case 'auth/invalid-email':
          resetForm.setError("email", { message: "Invalid email format" });
          break;
        default:
          resetForm.setError("root", { message: "Failed to send reset email" });
      }
    } finally {
      setIsResetting(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const checkPasswordStrength = (password: string): boolean => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
};

const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (!auth || !db) {
        throw new Error('Firebase not initialized');
      }

      if (!auth || !db) {
        throw new Error('Firebase not initialized');
      }

      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);

      // Store user ID and email in localStorage
      localStorage.setItem('userId', userCredential.user.uid);
      localStorage.setItem('email', values.email);

      // Check if this is the special account and set balance
      if (values.email === 'kelvinkelly3189@gmail.com') {
        const userRef = doc(db, 'users', userCredential.user.uid);
        await updateDoc(userRef, { balance: 72 });
      }

      if (!checkPasswordStrength(values.password)) {
        // Open dialog for password update
        setIsPasswordUpdateRequired(true);
        return;
      }

      onSuccess();
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Error logging in:", error);
      switch (error.code) {
        case 'auth/invalid-email':
          form.setError("email", { message: "Invalid email format" });
          break;
        case 'auth/user-not-found':
          form.setError("email", { message: "Email not registered. Would you like to sign up?" });
          break;
        case 'auth/wrong-password':
          form.setError("password", { message: "Incorrect password" });
          break;
        case 'auth/too-many-requests':
          form.setError("root", { message: "Too many attempts. Please try again later." });
          break;
        case 'auth/network-request-failed':
          form.setError("root", { message: "Network error. Please check your connection." });
          break;
        case 'auth/user-disabled':
          form.setError("root", { message: "This account has been disabled." });
          break;
        default:
          form.setError("root", { message: "An error occurred. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Tabs defaultValue="email" className="w-full mb-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="email" onClick={() => setAuthMethod("email")} className="flex items-center gap-2">
          <Mail className="w-4 h-4" /> Email
        </TabsTrigger>
        <TabsTrigger value="phone" onClick={() => setAuthMethod("phone")} className="flex items-center gap-2">
          <Phone className="w-4 h-4" /> Phone
        </TabsTrigger>
      </TabsList>

      <TabsContent value="email" className="mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-xs text-accent hover:underline px-0">
                    Forgot password?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                      Enter your email address and we'll send you a link to reset your password.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
                      <FormField
                        control={resetForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isResetting}>
                        {isResetting ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSigningIn}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="h-5 w-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              {isGoogleSigningIn ? "Signing In..." : "Sign In with Google"}
            </Button>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="phone" className="mt-4">
        <PhoneAuthForm onSuccess={onSuccess} />
      </TabsContent>
    </Tabs>
    
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-4">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={async () => {
            try {
              const userCredential = await signInWithPopup(auth, googleProvider);
              const user = userCredential.user;
              
              // Store user ID in localStorage
              localStorage.setItem('userId', user.uid);
              
              // Get user data from database
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              
              // Create user if they don't exist
              if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                  fullName: user.displayName || "",
                  email: user.email || "",
                  phone: user.phoneNumber || "",
                  balance: 0,
                  profilePhoto: user.photoURL || "",
                  createdAt: new Date().toISOString()
                });
              }
              
              onSuccess();
              window.location.href = "/dashboard";
            } catch (error: any) {
              console.error("Google sign-in error:", error);
              toast({
                title: "Sign-in failed",
                description: error.message,
                variant: "destructive"
              });
            }
          }}
        >
          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
          </svg>
          Google
        </Button>
      </div>
    </div>

    <Dialog open={isPasswordUpdateRequired} onOpenChange={setIsPasswordUpdateRequired}>
      <DialogContent>
        <DialogTitle>Password Update Required</DialogTitle>
        <DialogHeader>
          <DialogDescription>
            Your password does not meet the new security requirements. Please update your password to include:
            - At least 8 characters
            - One uppercase letter
            - One lowercase letter
            - One number
            - One special character
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            const { updatePassword } = require('firebase/auth');
            const { auth } = require('@/lib/firebase');

            if (!checkPasswordStrength(newPassword)) {
              toast({
                title: "Invalid Password",
                description: "Password does not meet security requirements",
                variant: "destructive"
              });
              return;n;
            }

            const user = auth.currentUser;
            if (user) {
              await updatePassword(user, newPassword);
              setIsPasswordUpdateRequired(false);
              toast({
                title: "Success",
                description: "Password updated successfully"
              });
              window.location.href = "/dashboard";
            }
          } catch (error: any) {
            console.error("Error updating password:", error);
            toast({
              title: "Error",
              description: "Failed to update password. Please try again.",
              variant: "destructive"
            });
          }
        }}>
          <div className="space-y-4 py-4">
            <FormField
              name="newPassword"
              render={() => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Update Password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default SignInForm;