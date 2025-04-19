import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
import { Phone, Mail } from "lucide-react";

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
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const { toast } = useToast();

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
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="phone" className="mt-4">
        <PhoneAuthForm onSuccess={onSuccess} />
      </TabsContent>
    </Tabs>

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
              return;
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