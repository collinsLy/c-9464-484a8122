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

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

interface SignInFormProps {
  onSuccess: () => void;
}

const SignInForm = ({ onSuccess }: SignInFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      console.log("Logged in user:", userCredential.user);

      // Call success callback
      onSuccess();

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Error logging in:", error);
      // Assuming 'toast' is available.  Replace with your preferred error handling.
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
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
          <a href="#" className="text-xs text-accent hover:underline">
            Forgot password?
          </a>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
};

export default SignInForm;