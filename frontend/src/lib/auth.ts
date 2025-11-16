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
      // Always fetch the latest user data from database to ensure approval status is current
      await dbConnect();

      const email = user?.email || token.email;
      const dbUser = await User.findOne({ email }).lean();

      if (dbUser) {
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
            return {}; // This will invalidate the session
          }
        }
      } else if (user) {
        // New user - set defaults
        token.id = user.id;
        token.email = user.email;

        // Check if this is the admin email
        if (user.email === process.env.ADMIN_EMAIL) {
          token.role = 'admin';
          token.isApproved = true;
        } else {
          token.role = 'pending';
          token.isApproved = false;
        }
      }

      return token;
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
