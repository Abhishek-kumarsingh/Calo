'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogoutPage() {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear any stored tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          sessionStorage.clear();

          // Clear any cookies
          document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
        }

        // Sign out from NextAuth
        await signOut({ redirect: false });

        // Set a small delay to ensure everything is cleared
        setTimeout(() => {
          setIsComplete(true);
        }, 1500);

      } catch (error) {
        console.error("Error during logout:", error);
        setIsComplete(true);
      }
    };

    performLogout();
  }, []);

  const handleRedirectToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        {isComplete ? (
          <>
            <LogOut className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Successfully Signed Out</h1>
            <p className="text-muted-foreground mb-6">Your session has been terminated and all data cleared.</p>
            <Button onClick={handleRedirectToLogin} className="w-full">
              Return to Login
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Signing out...</h1>
            <p className="text-muted-foreground">Clearing your session data.</p>
          </>
        )}
      </div>
    </div>
  );
}
