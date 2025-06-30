'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    // Get error message from URL
    const error = searchParams.get('error');
    
    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'Configuration': 'There is a problem with the server configuration. Please contact support.',
      'AccessDenied': 'You do not have permission to sign in.',
      'Verification': 'The verification link has expired or has already been used.',
      'OAuthSignin': 'Error in the OAuth sign-in process.',
      'OAuthCallback': 'Error in the OAuth callback process.',
      'OAuthCreateAccount': 'Could not create OAuth account.',
      'EmailCreateAccount': 'Could not create email account.',
      'Callback': 'Error in the callback process.',
      'OAuthAccountNotLinked': 'This email is already associated with another account.',
      'EmailSignin': 'Error sending the verification email.',
      'CredentialsSignin': 'The email or password you entered is incorrect.',
      'SessionRequired': 'Please sign in to access this page.',
      'Default': 'An unexpected error occurred. Please try again.'
    };
    
    setErrorMessage(error ? (errorMessages[error] || errorMessages.Default) : errorMessages.Default);
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem with your authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 rounded-md text-center mb-4">
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Try Again
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
