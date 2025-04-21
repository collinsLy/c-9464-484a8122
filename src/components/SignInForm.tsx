import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, updatePassword, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, appleProvider } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

interface SignInFormProps {
  onSuccess: () => void;
}

const SignInForm = ({ onSuccess }: SignInFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordUpdateRequired, setIsPasswordUpdateRequired] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

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
          form.setError("email", { message: "Email not registered" });
          break;
        case 'auth/wrong-password':
          form.setError("password", { message: "Incorrect password" });
          break;
        default:
          form.setError("root", { message: "An error occurred. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Store user ID and email in localStorage
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('email', user.email || '');
      localStorage.setItem('name', user.displayName || '');

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userDocRef, {
          fullName: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          balance: 0,
          profilePhoto: user.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Set flag to show welcome message on dashboard
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

      // Short delay to ensure toast is shown before redirect
      setTimeout(() => {
        onSuccess();
        window.location.href = "/dashboard";
      }, 500);
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Sign-in Error",
        description: error.message || "An error occurred during Google sign-in",
        variant: "destructive"
      });
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;
      
      // Get Apple credential
      const credential = OAuthProvider.credentialFromResult(result);
      
      // Store user ID and email in localStorage
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('email', user.email || '');
      localStorage.setItem('name', user.displayName || '');

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userDocRef, {
          fullName: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          balance: 0,
          profilePhoto: user.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Set flag to show welcome message on dashboard
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

      // Short delay to ensure toast is shown before redirect
      setTimeout(() => {
        onSuccess();
        window.location.href = "/dashboard";
      }, 500);
    } catch (error: any) {
      console.error("Apple sign-in error:", error);
      toast({
        title: "Sign-in Error",
        description: error.message || "An error occurred during Apple sign-in",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="form-container">
      <h2 className="auth-title">Log in</h2>
      <p className="auth-subtitle">Welcome back to your account</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            {isSubmitting ? "Signing in..." : "Log in"}
          </Button>

          <div className="auth-footer">
            Don't have an account?
            <a className="auth-link" href="#">Create account</a>
          </div>

          <div className="social-login-section">
            <Button 
              type="button" 
              className="social-button apple-button"
              onClick={handleAppleSignIn}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" fill="#ffffff"/>
              </svg>
              Sign in with Apple
            </Button>

            <Button 
              type="button" 
              className="social-button google-button"
              onClick={handleGoogleSignIn}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Sign in with Google
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
                  Sign in with Phone
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

      <Dialog open={isPasswordUpdateRequired} onOpenChange={setIsPasswordUpdateRequired}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Update Required</DialogTitle>
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
              <FormItem>
                <FormControl>
                  <Input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="auth-input"
                  />
                </FormControl>
              </FormItem>
              <Button type="submit" className="auth-button">
                Update Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignInForm;