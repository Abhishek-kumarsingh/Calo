import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import jwt from 'jsonwebtoken';
import UserModel from './models/User';
import connectToDatabase from './mongodb';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate JWT token
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { id: userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Get user from token
export async function getUserFromToken(token: string) {
  try {
    const decoded = await verifyToken(token);
    if (!decoded) return null;

    await connectToDatabase();
    const user = await UserModel.findById(decoded.id);
    return user;
  } catch (error) {
    return null;
  }
}

// Middleware to check if user is authenticated
export async function isAuthenticated(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return { authenticated: false, user: null };
    }
    
    // Get token from session
    const token = await generateTokenFromSession(session);
    
    if (!token) {
      return { authenticated: false, user: null };
    }
    
    // Verify token and get user
    const user = await getUserFromToken(token);
    
    if (!user) {
      return { authenticated: false, user: null };
    }
    
    return { authenticated: true, user, token };
  } catch (error) {
    return { authenticated: false, user: null };
  }
}

// Generate token from session
export async function generateTokenFromSession(session: any) {
  try {
    await connectToDatabase();
    
    // Find user by email
    const user = await UserModel.findOne({ email: session.user.email });
    
    if (!user) {
      return null;
    }
    
    // Generate token
    return generateToken(user._id.toString(), user.email);
  } catch (error) {
    return null;
  }
}
