'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function CheckSessionPage() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.reload();
  };

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
          <CardDescription>
            Check your current authentication status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : status === 'authenticated' ? (
            <>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Authenticated</AlertTitle>
                <AlertDescription>You are currently logged in.</AlertDescription>
              </Alert>
              
              <div className="rounded-md border p-4">
                <h4 className="font-medium mb-2">Session Data:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">User ID:</div>
                  <div>{session.user?.id || 'N/A'}</div>
                  <div className="font-medium">Name:</div>
                  <div>{session.user?.name || 'N/A'}</div>
                  <div className="font-medium">Email:</div>
                  <div>{session.user?.email || 'N/A'}</div>
                </div>
              </div>
              
              <div className="rounded-md border p-4">
                <h4 className="font-medium mb-2">Full Session:</h4>
                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Authenticated</AlertTitle>
              <AlertDescription>You are not currently logged in.</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {status === 'authenticated' ? (
            <Button 
              onClick={handleLogout} 
              variant="destructive"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
          )}
          
          <div className="flex justify-between w-full">
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/test-login">Test Login</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/debug">Debug Page</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
