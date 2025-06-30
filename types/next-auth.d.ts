// next-auth.d.ts (e.g., in project root or types/ folder)
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    // backendAccessToken?: string;
    user: {
      id?: string | null;
      role?: string | null;
      twoFactorEnabled?: boolean;
      twoFactorComplete?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    // This is the user object passed to jwt callback from authorize/OAuth
    id: string; // Make id non-optional here as authorize should always return it
    role?: string | null;
    twoFactorEnabled?: boolean;
    twoFactorComplete?: boolean;
    // backendAccessToken?: string;
    // name, email, image are part of DefaultUser
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    // This is the token object
    id?: string | null;
    role?: string | null;
    twoFactorEnabled?: boolean;
    twoFactorComplete?: boolean;
    // backendAccessToken?: string;
  }
}
