'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Info, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [testUser, setTestUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTestUser = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/test-user');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test user');
      }
      
      setTestUser(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loginWithTestUser = async () => {
    if (!testUser) {
      await createTestUser();
    }
    
    try {
      await signIn('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to login with test user');
    }
  };

  useEffect(() => {
    // Check if test user exists on page load
    createTestUser();
  }, []);

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Authentication Debug</CardTitle>
          <CardDescription>
            This page helps debug authentication issues in the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="session">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="session">Session Status</TabsTrigger>
              <TabsTrigger value="test-user">Test User</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="session" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Current Session</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
              
              <Alert variant={status === 'authenticated' ? 'default' : 'destructive'}>
                <div className="flex items-center gap-2">
                  {status === 'authenticated' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>Status: {status}</AlertTitle>
                </div>
                <AlertDescription>
                  {status === 'loading' && 'Loading session...'}
                  {status === 'authenticated' && 'You are authenticated.'}
                  {status === 'unauthenticated' && 'You are not authenticated.'}
                </AlertDescription>
              </Alert>
              
              {session && (
                <div className="rounded-md border p-4 mt-4">
                  <h4 className="font-medium mb-2">Session Data:</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="test-user" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Test User</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={createTestUser}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : testUser ? (
                <div className="rounded-md border p-4">
                  <h4 className="font-medium mb-2">Test User Details:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="font-medium">Name:</div>
                    <div>{testUser.user.name}</div>
                    <div className="font-medium">Email:</div>
                    <div>{testUser.user.email}</div>
                    <div className="font-medium">Password:</div>
                    <div>password123</div>
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Test Credentials</AlertTitle>
                    <AlertDescription>
                      You can use these credentials to test the login functionality.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No Test User</AlertTitle>
                  <AlertDescription>
                    No test user information available.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="actions" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Authentication Actions</h3>
              
              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <h4 className="font-medium">Test User</h4>
                  <div className="flex gap-2">
                    <Button onClick={createTestUser} disabled={loading}>
                      Create Test User
                    </Button>
                    <Button onClick={loginWithTestUser} disabled={loading || !testUser}>
                      Login as Test User
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex flex-col gap-2">
                  <h4 className="font-medium">Session Management</h4>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => signOut({ redirect: false })}
                      variant="destructive"
                      disabled={status !== 'authenticated'}
                    >
                      Sign Out (No Redirect)
                    </Button>
                    <Button 
                      onClick={() => signOut({ callbackUrl: '/auth/login' })}
                      variant="outline"
                      disabled={status !== 'authenticated'}
                    >
                      Sign Out (Redirect)
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex flex-col gap-2">
                  <h4 className="font-medium">Navigation</h4>
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href="/auth/login">Login Page</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/auth/register">Register Page</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
