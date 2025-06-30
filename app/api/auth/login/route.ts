import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, serverSideRequest } = await req.json();

    // Connect to the database
    await connectToDatabase();

    // Find user by email
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // If it's a server-side request (from Next.js API routes), skip password check
    if (!serverSideRequest) {
      // Check password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image
      },
      token
    });
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { message: 'Error logging in', error: (error as Error).message },
      { status: 500 }
    );
  }
}
