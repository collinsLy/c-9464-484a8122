import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface OpenAccountFormProps {
  onSuccess: () => void;
}

const UserBalanceService = {
  async createUserBalance(userId: string) {
    try {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { balance: 0 });
    } catch (error) {
      console.error("Error creating user balance:", error);
    }
  },

};


const OpenAccountForm = ({ onSuccess }: OpenAccountFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      // Create initial user data
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: values.fullName,
        email: values.email,
        balance: 0,
        phone: '',
        profilePhoto: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Store email and name in localStorage for other components
      localStorage.setItem('email', values.email);
      localStorage.setItem('name', values.fullName);
      
      await sendEmailVerification(userCredential.user);
      onSuccess();
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error("Error creating account:", error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          form.setError("email", { 
            message: "Email already registered. Please sign in instead." 
          });
          break;
        case 'auth/invalid-email':
          form.setError("email", { message: "Invalid email format" });
          break;
        case 'auth/operation-not-allowed':
          form.setError("root", { 
            message: "Account creation is currently disabled." 
          });
          break;
        case 'auth/weak-password':
          form.setError("password", { 
            message: "Password is too weak. Please use a stronger password." 
          });
          break;
        case 'auth/network-request-failed':
          form.setError("root", { 
            message: "Network error. Please check your connection." 
          });
          break;
        case 'auth/too-many-requests':
          form.setError("root", { 
            message: "Too many attempts. Please try again later." 
          });
          break;
        default:
          form.setError("root", { 
            message: "An error occurred. Please try again." 
          });
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
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormDescription>
                At least 8 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
};

export default OpenAccountForm;