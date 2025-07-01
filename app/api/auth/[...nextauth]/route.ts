import NextAuth, {
  NextAuthOptions,
  User as NextAuthUser,
  DefaultUser,
  DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { DefaultJWT, JWT as NextAuthJWT } from "next-auth/jwt";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logAuthEvent } from "@/lib/logger";

// Define custom user properties for NextAuth User and JWT/Session
interface ExtendedUser extends NextAuthUser {
  id: string;
  role?: string;
  image?: string | null;
  twoFactorEnabled?: boolean;
  twoFactorComplete?: boolean;
}

interface ExtendedToken extends NextAuthJWT {
  id?: string;
  role?: string;
  email?: string;
  name?: string;
  picture?: string;
  twoFactorEnabled?: boolean;
  twoFactorComplete?: boolean;
}

// Demo users for development
const DEMO_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@gmail.com",
    password: "password123",
    role: "admin",
    image: null
  },
  {
    id: "2",
    name: "Demo User",
    email: "demo@example.com",
    password: "demo123",
    role: "user",
    image: null
  }
];
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET, // Essential for production and JWT signing
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.warn("NextAuth Authorize: Email or password missing.");
          throw new Error("Please enter both email and password.");
        }

        // Extend credentials type to allow twoFactorToken
        const typedCredentials = credentials as typeof credentials & { twoFactorToken?: string };

        // Check if this is a 2FA validation request
        const twoFactorToken = typedCredentials.twoFactorToken as string | undefined;

        if (twoFactorToken) {
          try {
            // Verify the 2FA token
            const decoded = jwt.verify(twoFactorToken, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "your-secret-key") as {
              id: string;
              email: string;
              role: string;
              twoFactorComplete: boolean;
            };

            if (!decoded.twoFactorComplete) {
              throw new Error("Two-factor authentication not completed.");
            }

            console.log("NextAuth Authorize: 2FA validation successful for:", decoded.email);

            return {
              id: decoded.id,
              name: decoded.email.split('@')[0], // Temporary name
              email: decoded.email,
              role: decoded.role,
              twoFactorComplete: true
            };
          } catch (error) {
            console.error("NextAuth Authorize: Invalid 2FA token", error);
            throw new Error("Invalid or expired two-factor authentication token.");
          }
        }

        console.log(
          "NextAuth Authorize: Attempting login for:",
          credentials.email
        );

        try {
          // Connect to MongoDB
          await connectToDatabase();

          // Find user by email, include 2FA status
          const user = await UserModel.findOne({ email: credentials.email });

          if (!user) {
            console.error("NextAuth Authorize: User not found");
            throw new Error("Invalid email or password.");
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.error("NextAuth Authorize: Invalid password");

            // Log failed login attempt
            await logAuthEvent(
              { action: "login_failed", message: `Failed login attempt for user: ${credentials.email}`, severity: "failure" }
            );

            throw new Error("Invalid email or password.");
          }

          // Check if 2FA is enabled
          if (user.twoFactorEnabled) {
            console.log("NextAuth Authorize: 2FA required for:", user.email);

            // Create a temporary token for 2FA validation
            const validationToken = jwt.sign(
              {
                email: user.email,
                twoFactorPending: true
              },
              process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "your-secret-key",
              { expiresIn: "5m" }
            );

            // Log 2FA pending
            await logAuthEvent(
              { action: "2fa_required", message: `2FA required for user: ${user.email}`, severity: "info" },
              user._id.toString()
            );

            // Return a special response for 2FA
            throw new Error(JSON.stringify({
              error: "2FA_REQUIRED",
              email: user.email,
              validationToken
            }));
          }

          console.log("NextAuth Authorize: Login successful for:", user.email);

          // Update last login time
          user.lastLogin = new Date();
          await user.save();

          // Log successful login
          await logAuthEvent(
            { action: "login_success", message: `Successful login for user: ${user.email}`, severity: "success" },
            user._id.toString()
          );

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role || "user"
          };
        } catch (error: any) {
          console.error("NextAuth Authorize Error:", error);

          // Check if this is a 2FA required error
          if (error.message && error.message.includes("2FA_REQUIRED")) {
            throw error; // Re-throw the 2FA error
          }

          // Fallback to demo users for development
          const demoUser = DEMO_USERS.find(user =>
            user.email === credentials.email &&
            user.password === credentials.password
          );

          if (demoUser) {
            console.log("NextAuth Authorize: Login successful with demo user:", demoUser.email);
            return {
              id: demoUser.id,
              name: demoUser.name,
              email: demoUser.email,
              image: demoUser.image,
              role: demoUser.role
            };
          }

          throw new Error("Invalid email or password.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JSON Web Tokens for session management
    maxAge: 8 * 60 * 60, // Session will expire after 8 hours of inactivity
    updateAge: 1 * 60 * 60, // Update session every hour
  },
  jwt: {
    // Set a short maxAge to force re-authentication when server restarts
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/auth/login", // Your custom login page route
    signOut: "/auth/logout", // Optional: custom signout page
    error: "/auth/error", // Optional: custom error page (e.g., for OAuth errors)
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback triggered', { provider: account?.provider });

      // Only handle Google provider sign-ins
      if (account?.provider === 'google' && profile?.email) {
        console.log('Processing Google sign-in for:', profile.email);
        console.log('Profile data:', JSON.stringify(profile));

        try {
          // Connect to MongoDB
          await connectToDatabase();

          // Check if user already exists
          const existingUser = await UserModel.findOne({ email: profile.email });

          if (!existingUser) {
            console.log(`Creating new user for Google account: ${profile.email}`);

            // Create a new user
            const newUser = new UserModel({
              name: profile.name || (profile as any).given_name || 'Google User',
              email: profile.email,
              // No password needed for OAuth users
              password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
              image: profile.image || (profile as any).picture,
              role: 'user',
            });

            // Save the user to the database
            const savedUser = await newUser.save();

            // Update the user object with the database ID
            user.id = savedUser._id.toString();
            console.log(`New user created with ID: ${user.id}`);
          } else {
            // Update the user object with the existing user's ID
            user.id = existingUser._id.toString();
            console.log(`Existing user found with ID: ${user.id}`);
          }
        } catch (error) {
          console.error('Error in Google sign-in callback:', error);
          return false; // Return false to deny sign-in
        }
      }

      return true; // Allow sign-in
    },

    async jwt({ token, user }) {
      if (user) {
        // `user` will be available on the first sign-in, after the `authorize` method
        token.id = user.id;
        token.role = user.role;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined; // Use user.image if available

        console.log(`JWT callback - Setting token for user:`, {
          id: user.id,
          email: user.email,
          role: user.role
        });

        // Include 2FA information
        if ((user as ExtendedUser).twoFactorEnabled !== undefined) {
          token.twoFactorEnabled = (user as ExtendedUser).twoFactorEnabled;
        }

        if ((user as ExtendedUser).twoFactorComplete !== undefined) {
          token.twoFactorComplete = (user as ExtendedUser).twoFactorComplete;
        }
      } else {
        console.log(`JWT callback - No user provided, using existing token:`, {
          id: token.id,
          email: token.email,
          role: token.role
        });
      }

      return token as ExtendedToken; // Cast to ExtendedToken
    },

    async session({ session, token }) {
      const extendedToken = token as ExtendedToken;
      // Augment the session object with the token properties
      if (session.user) {
        session.user.id = extendedToken.id;
        session.user.role = extendedToken.role;
        session.user.name = extendedToken.name;
        session.user.email = extendedToken.email;
        session.user.image = extendedToken.picture;

        console.log(`Session callback - Creating session for user:`, {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role
        });

        // Include 2FA information
        if (extendedToken.twoFactorEnabled !== undefined) {
          (session.user as any).twoFactorEnabled = extendedToken.twoFactorEnabled;
        }

        if (extendedToken.twoFactorComplete !== undefined) {
          (session.user as any).twoFactorComplete = extendedToken.twoFactorComplete;
        }
      }
      return session;
    },
  },
  logger: {
    error(code, metadata) {
      console.error(`NEXTAUTH_ERROR: Code=${code}`, metadata);
    },
    warn(code) {
      console.warn(`NEXTAUTH_WARN: Code=${code}`);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
