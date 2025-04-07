
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      await signInWithEmailAndPassword(auth, values.email, values.password);
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
  );
};

export default SignInForm;
