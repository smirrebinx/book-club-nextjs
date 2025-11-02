import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";

import { authConfig } from "@/lib/auth.config";
import clientPromise from "@/lib/mongodb-client";

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
    async jwt({ token, user, trigger }) {
      // On signin, check if user should be admin
      if (user) {
        token.id = user.id;
        token.email = user.email;

        // Check if this is the admin email
        if (user.email === process.env.ADMIN_EMAIL) {
          token.role = 'admin';
          token.isApproved = true;
        } else {
          // Default for new users
          token.role = 'pending';
          token.isApproved = false;
        }
      }

      // On update, you can refresh token data from database if needed
      if (trigger === 'update') {
        // Optionally fetch fresh data from database here
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
