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
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";

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
  const { toast } = useForm();

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user already exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Store user info in localStorage regardless of new or existing user
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('email', user.email || '');
      localStorage.setItem('name', user.displayName || '');
      
      // Create a session flag to show the welcome notification on dashboard
      let isNewAccount = false;
      
      if (!userDoc.exists()) {
        // Create new user
        await setDoc(userDocRef, {
          fullName: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          balance: 0,
          profilePhoto: user.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        // Set flag for new account to show welcome message on dashboard
        isNewAccount = true;
        localStorage.setItem('showWelcome', 'true');
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        });
      } else {
        toast({
          title: "Sign-in successful",
          description: "Welcome back to your account.",
        });
      }
      
      // This ensures the redirect happens after toast is shown
      setTimeout(() => {
        onSuccess();
        window.location.href = "/dashboard";
      }, 500);
    } catch (error: any) {
      console.error("Google sign-up error:", error);
      toast({
        title: "Sign-up Error",
        description: error.message || "An error occurred during Google sign-up",
        variant: "destructive"
      });
    }
  };

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
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignUp}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          Sign up with Google
        </Button>
      </form>
    </Form>
  );
};

export default OpenAccountForm;