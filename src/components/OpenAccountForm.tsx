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
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(), // Added phone field to schema
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface OpenAccountFormProps {
  onSuccess: () => void;
}


const OpenAccountForm = ({ onSuccess }: OpenAccountFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningUp, setIsGoogleSigningUp] = useState(false); // Added state for Google Sign-Up
  const googleProvider = new GoogleAuthProvider();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "", // Added default value for phone
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
        phone: values.phone ? (values.phone.startsWith('+') ? values.phone : `+${values.phone}`) : "", // Format phone number with country code
        balance: 0,
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
      //Error Handling remains the same
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

  const handleGoogleSignUp = async () => {
    setIsGoogleSigningUp(true);
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

        toast({
          title: "Account created successfully",
          description: "Welcome to Vertex Trading!",
        });
      } else {
        toast({
          title: "Welcome back",
          description: "You already have an account with us.",
        });
      }

      onSuccess(); // Call onSuccess after successful Google sign-up
    } catch (error: any) {
      console.error("Google sign-up error:", error);
      toast({
        title: "Sign-up failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGoogleSigningUp(false);
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
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

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignUp}
              disabled={isGoogleSigningUp}
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
              {isGoogleSigningUp ? "Signing Up..." : "Sign Up with Google"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default OpenAccountForm;