"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  KeyRound,
  Shield,
  User,
  AlertTriangle
} from "lucide-react";
import { TwoFactorForm } from "@/components/auth/two-factor-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [accountType, setAccountType] = useState("user"); // Default to regular user
  const [showAdminWarning, setShowAdminWarning] = useState(false);

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl') || '/dashboard';
      router.push(callbackUrl);
    }
  }, [status, router]);

  // Show admin warning when admin account type is selected
  useEffect(() => {
    setShowAdminWarning(accountType === "admin");

    // We no longer auto-fill credentials to avoid security issues
    // and prevent automatic login/logout cycles
  }, [accountType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", {
        email,
        password: "***",
        accountType,
      });

      let result;
      if (accountType === "admin") {
        // Admin login flow
        console.log("Using NextAuth for admin login");
        result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        console.log("Admin login result:", result);
      } else {
        // Regular user login flow
        console.log("Using custom API for regular user login");
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        
        // Store the JWT token
        localStorage.setItem('token', data.token);
        console.log('Token saved to localStorage');

        // Now sign in with NextAuth
        result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        
        // Double check that token is properly stored
        const storedToken = localStorage.getItem('token');
        console.log('Token verification after login:', storedToken ? 'token exists' : 'token missing');
      }

      if (result?.error) {
        // Check if this is a 2FA required error
        try {
          const errorData = JSON.parse(result.error);
          if (errorData.error === "2FA_REQUIRED") {
            setTwoFactorRequired(true);
            setTwoFactorEmail(email);
            setTwoFactorToken(errorData.validationToken);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Not a JSON error, continue with normal error handling
        }
        throw new Error(result.error);
      }

      // Success handling
      if (accountType === "admin") {
        toast({
          title: "Admin Login Successful!",
          description: "Redirecting to admin dashboard...",
          className: "bg-red-500 text-white",
        });
        await router.push("/admin");
        router.refresh();
      } else {
        toast({
          title: "Login Successful!",
          description: "Redirecting to your dashboard...",
          className: "bg-green-500 text-white",
        });
        // Get the callback URL from the query parameters or default to dashboard
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get('callbackUrl') || '/dashboard';
        window.location.href = callbackUrl; // Force full reload for regular user
      }

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // Determine callback URL based on account type
      const callbackUrl = accountType === "admin" ? "/admin" : "/dashboard";

      // Show a warning for admin login with Google
      if (accountType === "admin") {
        toast({
          title: "Admin Google Login",
          description: "Attempting to sign in as administrator with Google.",
          className: "bg-red-500 text-white",
        });
      }

      await signIn("google", {
        callbackUrl: callbackUrl,
        // redirect: true, // signIn with redirect: true doesn't return, it navigates.
      });
      // If redirect: true, this part below won't be reached on success.
    } catch (error: any) {
      // Catches errors if signIn itself throws before redirecting
      console.error("Google login initiation error:", error);
      toast({
        title: "Google Sign-In Error",
        description:
          error.message || "Could not start Google sign-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false); // This might not be hit if redirect: true succeeds.
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md shadow-xl dark:bg-slate-850">
        {twoFactorRequired ? (
          <CardContent className="pt-6">
            <TwoFactorForm
              email={twoFactorEmail}
              validationToken={twoFactorToken}
              onSuccess={() => {
                // Redirect based on account type after 2FA
                if (accountType === "admin") {
                  toast({
                    title: "Admin Login Successful!",
                    description: "Two-factor authentication verified.",
                    className: "bg-red-500 text-white",
                  });
                  router.push("/admin");
                } else {
                  router.push("/dashboard");
                }
                router.refresh();
              }}
              onCancel={() => {
                setTwoFactorRequired(false);
                setTwoFactorEmail("");
                setTwoFactorToken("");
              }}
            />
          </CardContent>
        ) : (
          <>
            <CardHeader className="space-y-1 text-center">
              {/* Optional: Add a logo here */}
              {/* <img src="/logo.png" alt="Company Logo" className="w-20 h-20 mx-auto mb-2" /> */}
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome Back!
              </CardTitle>
              <CardDescription>
                Sign in to access your interview dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {" "}
              {/* Added pt-6 */}
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                className={`w-full text-sm font-medium ${accountType === "admin" ? "border-red-300 text-red-700 hover:bg-red-50" : ""}`}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : accountType === "admin" ? (
                  <Shield className="mr-2 h-4 w-4 text-red-500" />
                ) : (
                  <span className="mr-2 h-5 w-5" />
                )}
                {accountType === "admin" ? "Sign in to Admin with Google" : "Sign in with Google"}
              </Button>
              <div className="relative my-6">
                {" "}
                {/* Increased margin */}
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t dark:border-slate-700" />{" "}
                  {/* Dark mode border */}
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground dark:bg-slate-850">
                    {" "}
                    {/* Dark mode bg */}
                    Or continue with email
                  </span>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Type Selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select
                    value={accountType}
                    onValueChange={setAccountType}
                  >
                    <SelectTrigger id="accountType">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user" className="flex items-center">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          <span>Regular User</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin" className="flex items-center">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-red-500" />
                          <span>Administrator</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin Warning */}
                {showAdminWarning && (
                  <Alert className="bg-red-50 text-red-800 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertTitle className="text-red-500">Admin Access</AlertTitle>
                    <AlertDescription className="text-sm">
                      <p className="mb-2">You are logging in with administrator privileges. This account has full system access.</p>
                      <p className="font-medium mb-1">Demo Admin Credentials:</p>
                      <p>Email: abhi90067@gmail.com</p>
                      <p className="mb-2">Password: Aa2275aA</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 text-xs bg-white hover:bg-red-50 border-red-200 text-red-600"
                        onClick={() => {
                          setEmail("abhi90067@gmail.com");
                          setPassword("Aa2275aA");
                        }}
                      >
                        Fill Admin Credentials
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                    required
                    autoComplete="email"
                    className={accountType === "admin" ? "border-red-300 focus:ring-red-500" : ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                      tabIndex={-1}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                    required
                    autoComplete="current-password"
                    className={accountType === "admin" ? "border-red-300 focus:ring-red-500" : ""}
                  />
                </div>
                <Button
                  type="submit"
                  className={`w-full font-semibold ${accountType === "admin" ? "bg-red-500 hover:bg-red-600" : ""}`}
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : accountType === "admin" ? (
                    <Shield className="mr-2 h-4 w-4" />
                  ) : null}
                  {accountType === "admin" ? "Sign In as Administrator" : "Sign In"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center gap-3 pt-6">
              {" "}
              {/* Added pt-6 */}
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up now
                </Link>
              </p>
              {/* The Admin Login link might be better placed in a footer or a different section
                  if it's a distinct user flow, or remove if not generally applicable. */}
              {/* <p className="text-xs text-muted-foreground">
                <Link href="/admin" className="hover:underline">
                  Admin Access
                </Link>
              </p> */}
            </CardFooter>
          </>
        )}
      </Card>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Your Interview App. All rights reserved.
        {/* <br /> */}
        {/* <Link href="/privacy" className="hover:underline">Privacy Policy</Link> · <Link href="/terms" className="hover:underline">Terms of Service</Link> */}
      </p>
    </div>
  );
}
