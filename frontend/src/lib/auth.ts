import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";

import { authConfig } from "@/lib/auth.config";
import dbConnect from "@/lib/mongodb";
import clientPromise from "@/lib/mongodb-client";
import User from "@/models/User";

import type { UserRole } from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
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
    strategy: "jwt", // Temporarily use JWT to test if login works
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        // Always fetch the latest user data from database to ensure approval status is current
        console.log('[Auth] JWT callback - Connecting to database...');
        await dbConnect();
        console.log('[Auth] JWT callback - Database connected');

        const email = user?.email || token.email;

        if (!email) {
          console.error('[Auth] JWT callback - No email found in user or token');
          return token;
        }

        console.log('[Auth] JWT callback - Fetching user data for:', email);
        const dbUser = await User.findOne({ email }).lean();

        if (dbUser) {
          console.log('[Auth] JWT callback - User found, role:', dbUser.role, 'isApproved:', dbUser.isApproved);
          token.id = dbUser._id.toString();
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.isApproved = dbUser.isApproved;

          // Check if admin has forced this user to logout
          if (dbUser.forcedLogoutAt) {
            const tokenIssuedAt = token.iat ? new Date(token.iat * 1000) : new Date(0);
            const forcedLogoutAt = new Date(dbUser.forcedLogoutAt);

            // If token was issued before forced logout, invalidate it by returning empty token
            if (tokenIssuedAt < forcedLogoutAt) {
              console.log('[Auth] JWT callback - User was forced to logout');
              return {}; // This will invalidate the session
            }
          }
        } else if (user) {
          // New user - set defaults
          console.log('[Auth] JWT callback - New user, setting defaults');
          token.id = user.id;
          token.email = user.email;

          // Check if this is the admin email
          if (user.email === process.env.ADMIN_EMAIL) {
            console.log('[Auth] JWT callback - User is admin');
            token.role = 'admin';
            token.isApproved = true;
          } else {
            console.log('[Auth] JWT callback - User is pending approval');
            token.role = 'pending';
            token.isApproved = false;
          }
        } else {
          console.log('[Auth] JWT callback - No user found in database or session');
        }

        return token;
      } catch (error) {
        console.error('[Auth] JWT callback - Error:', error);
        console.error('[Auth] JWT callback - Error details:', error instanceof Error ? error.message : 'Unknown error');
        // Return token as-is to prevent breaking the session completely
        // This allows users to stay logged in even if database is temporarily unavailable
        return token;
      }
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
