import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import { verifyToken, verifyHashedBackupCode } from "@/lib/two-factor";
import { logAuthEvent } from "@/lib/logger";
import jwt from "jsonwebtoken";

// JWT Secret for 2FA validation token
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "your-secret-key";

// POST to validate 2FA token
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token, validationToken, isBackupCode = false } = body;

    if (!email || !token || !validationToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the validation token
    let decoded;
    try {
      decoded = jwt.verify(validationToken, JWT_SECRET) as { 
        email: string; 
        twoFactorPending: boolean;
        exp: number;
      };
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired validation token" },
        { status: 401 }
      );
    }

    // Check if the token is for the correct user and is a 2FA pending token
    if (decoded.email !== email || !decoded.twoFactorPending) {
      return NextResponse.json(
        { error: "Invalid validation token" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the user by email, including 2FA fields
    const user = await UserModel.findOne({ email })
      .select("+twoFactorSecret +twoFactorBackupCodes");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if 2FA is enabled for this user
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled for this user" },
        { status: 400 }
      );
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      const { valid, updatedCodes } = verifyHashedBackupCode(
        token,
        user.twoFactorBackupCodes || []
      );
      
      isValid = valid;
      
      // If valid, update the backup codes
      if (isValid) {
        user.twoFactorBackupCodes = updatedCodes;
        await user.save();
      }
    } else {
      // Verify TOTP token
      isValid = verifyToken(token, user.twoFactorSecret || "");
    }

    if (!isValid) {
      // Log failed attempt
      await logAuthEvent(
        "2fa_validation_failed",
        `Failed 2FA validation attempt for user: ${email}`,
        user._id.toString(),
        "failure",
        req
      );

      return NextResponse.json(
        { error: isBackupCode ? "Invalid backup code" : "Invalid verification code" },
        { status: 400 }
      );
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Log successful validation
    await logAuthEvent(
      "2fa_validation_success",
      `Successful 2FA validation for user: ${email}`,
      user._id.toString(),
      "success",
      req
    );

    // Create a new token that indicates 2FA is complete
    const authToken = jwt.sign(
      { 
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        twoFactorComplete: true
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication validated successfully",
      token: authToken
    });
  } catch (error: any) {
    console.error("Error in 2FA validation API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
