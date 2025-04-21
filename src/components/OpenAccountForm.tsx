
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, OAuthProvider } from "firebase/auth";
import { auth, db, googleProvider, appleProvider } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import PhoneAuthForm from "./PhoneAuthForm";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

interface OpenAccountFormProps {
  onSuccess: () => void;
}

const OpenAccountForm = ({ onSuccess }: OpenAccountFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        balance: 0,
        profilePhoto: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      localStorage.setItem('email', values.email);
      localStorage.setItem('name', values.fullName);
      localStorage.setItem('userId', userCredential.user.uid);
      localStorage.setItem('showWelcome', 'true');

      await sendEmailVerification(userCredential.user);
      onSuccess();
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
      window.location.href = "/dashboard";
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
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user already exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // Store user info in localStorage
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('email', user.email || '');
      localStorage.setItem('name', user.displayName || '');

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

  const handleAppleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;
      
      // Get Apple credential
      const credential = OAuthProvider.credentialFromResult(result);

      // Check if user already exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // Store user info in localStorage
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('email', user.email || '');
      localStorage.setItem('name', user.displayName || '');

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

      setTimeout(() => {
        onSuccess();
        window.location.href = "/dashboard";
      }, 500);
    } catch (error: any) {
      console.error("Apple sign-up error:", error);
      toast({
        title: "Sign-up Error",
        description: error.message || "An error occurred during Apple sign-up",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="form-container">
      <h2 className="auth-title">Create account</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-field">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormControl>
                  <Input className="auth-input" placeholder="Name" {...field} />
                </FormControl>
              )}
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormControl>
                  <Input className="auth-input" placeholder="Email" {...field} />
                </FormControl>
              )}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          
          <div className="form-field">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormControl>
                  <Input className="auth-input" placeholder="Phone" {...field} />
                </FormControl>
              )}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormControl>
                  <Input className="auth-input" type="password" placeholder="Password" {...field} />
                </FormControl>
              )}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>
          
          <div className="auth-footer">
            Already have an account?
            <a className="auth-link" href="#">Log in</a>
          </div>
          
          <div className="social-login-section">
            <Button 
              type="button" 
              className="social-button apple-button"
              onClick={handleAppleSignUp}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" fill="#ffffff"/>
              </svg>
              Sign up with Apple
            </Button>
            
            <Button 
              type="button" 
              className="social-button google-button"
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
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  type="button" 
                  className="social-button phone-button mt-2 w-full"
                  style={{ backgroundColor: "#10B981" }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="white" className="mr-2">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5.52 4.48 10 10 10 5.52 0 10-4.48 10-10zM8 12l4-4h3l-4 4 4 4h-3l-4-4z" />
                  </svg>
                  Sign up with Phone
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Phone Authentication</DialogTitle>
                </DialogHeader>
                <PhoneAuthForm onSuccess={onSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OpenAccountForm;
