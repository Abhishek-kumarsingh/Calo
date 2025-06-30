'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

export default function SaveToken() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const saveTokenFromResponse = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          // Make a request to the backend to get the JWT token
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: session.user.email,
              // Since we don't have the password here, we'll use a special endpoint
              // that verifies the NextAuth session and returns a token
              nextAuthSession: true,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.token) {
              // Save the token to localStorage
              localStorage.setItem('token', data.token);
              console.log('Token saved to localStorage');
              
              // Redirect to dashboard
              router.push('/dashboard');
            }
          } else {
            console.error('Failed to get token from backend');
          }
        } catch (error) {
          console.error('Error saving token:', error);
        }
      }
    };

    saveTokenFromResponse();
  }, [session, status, router]);

  return null;
}
