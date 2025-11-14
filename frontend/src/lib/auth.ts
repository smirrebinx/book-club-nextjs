import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";

import { authConfig } from "@/lib/auth.config";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

import type { IUser, UserRole } from "@/models/User";
import type { JWT } from "next-auth/jwt";

// Lean document type includes MongoDB _id
type UserLeanDoc = IUser & { _id: { toString: () => string } };

/**
 * Helper: Create new user in database
 */
async function createNewUser(email: string, name?: string | null, image?: string | null) {
  const isAdmin = email === process.env.ADMIN_EMAIL;
  console.log('[Auth] Creating new user:', email);

  const newUser = await User.create({
    name: name || '',
    email: email,
    image: image || '',
    role: isAdmin ? 'admin' : 'pending',
    isApproved: isAdmin,
  });

  console.log('[Auth] User created successfully:', newUser._id);
  return newUser.toObject();
}

/**
 * Helper: Check if user should be logged out
 */
function shouldForceLogout(dbUser: UserLeanDoc, tokenIssuedAt?: number): boolean {
  if (!dbUser.forcedLogoutAt) return false;

  const tokenDate = tokenIssuedAt ? new Date(tokenIssuedAt * 1000) : new Date(0);
  const forcedDate = new Date(dbUser.forcedLogoutAt);

  return tokenDate < forcedDate;
}

/**
 * Helper: Populate token with user data
 */
function populateToken(token: JWT, dbUser: UserLeanDoc): JWT {
  token.id = dbUser._id.toString();
  token.email = dbUser.email;
  token.role = dbUser.role;
  token.isApproved = dbUser.isApproved;
  return token;
}

/**
 * Helper: Get fallback token for failed user creation
 */
function getFallbackToken(token: JWT, email: string, userId?: string): JWT {
  const isAdmin = email === process.env.ADMIN_EMAIL;
  token.id = userId || email;
  token.email = email;
  token.role = isAdmin ? 'admin' : 'pending';
  token.isApproved = isAdmin;
  return token;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // No adapter - we manage users manually with JWT sessions
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT for serverless compatibility
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Only process on signin or update
      if (!user && trigger !== 'update') {
        return token;
      }

      console.log('[Auth JWT] Processing token for user:', user?.email || token.email);
      await dbConnect();

      const email = user?.email || token.email as string;
      if (!email) {
        console.error('[Auth JWT] No email found');
        return token;
      }

      // Fetch existing user
      let dbUser = await User.findOne({ email }).lean() as UserLeanDoc | null;

      // Create new user if needed
      if (!dbUser && user) {
        try {
          dbUser = await createNewUser(email, user.name, user.image) as UserLeanDoc;
        } catch (error) {
          console.error('[Auth JWT] Error creating user:', error);
          return getFallbackToken(token, email, user.id);
        }
      }

      // No user found and couldn't create
      if (!dbUser) {
        return token;
      }

      // Check forced logout
      if (shouldForceLogout(dbUser, token.iat)) {
        console.log('[Auth JWT] User forced to logout');
        return {}; // Invalidate session
      }

      // Populate and return token
      console.log('[Auth JWT] Token updated for user:', dbUser._id);
      return populateToken(token, dbUser);
    },
    async session({ session, token }) {
      // Add data from JWT token to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.isApproved = token.isApproved as boolean;
      }
      return session;
    },
  },
});
