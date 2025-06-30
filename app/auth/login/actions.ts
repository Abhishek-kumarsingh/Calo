'use server';

import { signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';

export async function loginUser(email: string, password: string) {
  try {
    // Get JWT token from our API
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/api/auth/login`, {
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
    
    // Store the JWT token in localStorage (this will be done client-side)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
    }

    // Sign in with NextAuth
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return { success: true, token: data.token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: (error as Error).message };
  }
}
