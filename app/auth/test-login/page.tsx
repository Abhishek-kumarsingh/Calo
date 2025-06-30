'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TestLoginPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setResult(null);
      
      console.log('Attempting login with:', { email, password });
      
      const response = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      setResult(response);
      
      if (response?.error) {
        setError(response.error);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Test Login</CardTitle>
          <CardDescription>
            Use this page to test the login functionality with hardcoded credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Login Successful</AlertTitle>
              <AlertDescription>You have been authenticated successfully.</AlertDescription>
            </Alert>
          )}
          
          {result && (
            <div className="rounded-md border p-4 mt-4">
              <h4 className="font-medium mb-2">Response:</h4>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={handleLogin} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Test Login'
            )}
          </Button>
          <div className="flex justify-between w-full">
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/login">Regular Login</Link>
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
