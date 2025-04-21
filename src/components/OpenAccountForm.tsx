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
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();

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
    <div className="form-container">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="input-row">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormControl>
                  <Input className="input-field" placeholder="Email/Phone number" {...field} />
                </FormControl>
              )}
            />
            <Button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Sign Up"}
            </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or Continue With
              </span>
            </div>
          </div>

          <div className="social-buttons">
            <Button 
              type="button" 
              variant="outline" 
              className="social-button"
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
            <Button 
              type="button" 
              variant="outline" 
              className="social-button"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
              </svg>
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="social-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.1 11.5c0-.7-.1-1.3-.2-2H12v3.8h5.7c-.2 1.2-.9 2.2-2 2.9v2.4h3.2c1.9-1.7 3-4.3 3-7.1h.2z" fill="#4285F4"/>
                <path d="M12 22.2c2.7 0 4.9-.9 6.5-2.4l-3.2-2.4c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.5-4h-3.3v2.5c1.6 3.2 5 5.3 8.8 5.3z" fill="#34A853"/>
                <path d="M6.5 14.3c-.2-.6-.3-1.2-.3-1.9 0-.6.1-1.3.3-1.9V8.1H3.3C2.5 9.4 2 11.1 2 12.5s.5 3.1 1.3 4.4l3.2-2.6z" fill="#FBBC05"/>
                <path d="M12 6.6c1.4 0 2.7.5 3.7 1.4L18.9 5c-1.7-1.6-4-2.5-6.9-2.5-3.8 0-7.2 2.1-8.8 5.3l3.3 2.5c.8-2.2 2.9-3.7 5.5-3.7z" fill="#EA4335"/>
              </svg>
            </Button>
          </div>

          <div>
            <p className="text-sm text-center text-muted-foreground mt-4">
              Download App
            </p>
            <div className="flex justify-center gap-3 mt-2">
              <Button variant="outline" size="icon" className="h-10 w-10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.05 20.28c-.98.95-2.05 1.68-3.12 2.1-1.32.53-2.54.53-3.66 0-1.14-.54-2.21-1.26-3.2-2.21-2.47-2.36-4.63-6.66-4.63-10.7 0-3.12 1.67-4.92 3.77-5.02.02 0 .05 0 .07-.01h.11c.14 0 .44.09.78.2.52.17 1.12.64 1.74 1.27l1.21 1.2c.57.59.52 1.52-.12 2.09l-.59.51c-.35.3-.41.86-.12 1.25.31.42.83 1.08 1.51 1.75.69.67 1.35 1.2 1.77 1.51.38.28.94.22 1.24-.13l.5-.59c.58-.65 1.51-.7 2.09-.13l1.2 1.21c.88.87 1.43 1.71 1.44 2.56v.16c-.06 2.04-1.89 3.68-3.89 3.68M17.04 12c-.3 0-.54.24-.54.54s.24.54.54.54.54-.24.54-.54-.24-.54-.54-.54m-3-3c-.3 0-.54.24-.54.54s.24.54.54.54.54-.24.54-.54-.24-.54-.54-.54m6 0c-.3 0-.54.24-.54.54s.24.54.54.54.54-.24.54-.54-.24-.54-.54-.54m-3-3c-.3 0-.54.24-.54.54s.24.54.54.54.54-.24.54-.54-.24-.54-.54-.54" fill="currentColor"/>
                </svg>
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.941 1.5C16.1 1.5 17.351 2.674 18.575 3.837C17.815 4.51 17.101 5.266 16.611 6.09C15.799 5.444 15.077 4.846 14.037 4.838C12.235 4.822 10.597 6.729 10.597 8.509c.0018 1.263.4969 2.215 1.411 3.213.4554.499.9861.912 1.534 1.485-.3375.1088-.6915.2159-1.026.318-1.061.3231-2.047.6928-2.985 1.19-.9828.5151-1.879 1.203-2.46 2.224-.6615 1.164-.9374 2.431-.3604 4.062.3848 1.088 1.238 2.189 2.427 2.86 1.161.6543 2.438.9319 3.834.9501 1.451.0192 3.023-.3241 4.453-.9673.7213-.3232 1.433-.7461 2.068-1.285-1.883-1.28-3.251-2.935-3.931-4.933-.6923-2.03-.685-4.964.6606-6.344.7204-.738 1.551-1.064 2.516-1.064.9649 0 1.795.3261 2.516 1.064 1.345 1.38 1.354 4.313.6606 6.344-.6816 1.997-2.048 3.653-3.931 4.933 2.016 1.699 4.757 2.446 7.478 1.621-.5467-2.901-1.13-5.797-1.752-8.692-.4036-1.873-.8249-3.744-1.257-5.613-.212-.919-.4275-1.843-.6474-2.748-.1121-.461-.2214-.924-.347-1.377-.1223-.44-.2286-.9226-.4341-1.333-.4204-.835-1.24-1.501-2.307-1.707-.542-.104-1.138-.052-1.645.0524zm2.386 9.9435c-.451-.4778-.9828-.5675-1.511-.1351-.5295.4333-.5804.9839-.1311 1.462.4509.478.9829.568 1.511.134.5293-.4324.581-.9821.1311-1.461m-7.458 9.1725c.471.5675 1.035.6656 1.646.1088.6097-.5578.6661-1.147.1939-1.714-.471-.5667-1.035-.6656-1.645-.1088-.6097.5569-.6669 1.147-.1939 1.714m6.854-2.395c.4614-.4686 1.008-.553 1.548-.1053.54.4469.5892 1.007.1278 1.475-.4613.468-1.007.5539-1.548.1061-.54-.4469-.5892-1.008-.1278-1.476m-3.835-9.7465c.4788.4704.5569 1.025.1053 1.569-.4515.544-1.01.593-1.489.124-.4788-.4713-.5567-1.025-.1053-1.569.4516-.5439 1.01-.5931 1.489-.124" fill="currentColor"/>
                </svg>
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OpenAccountForm;