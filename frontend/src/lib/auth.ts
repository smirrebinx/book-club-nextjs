import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";

import { authConfig } from "@/lib/auth.config";
import connectDB from "@/lib/mongodb";
import clientPromise from "@/lib/mongodb-client";
import User from "@/models/User";

import type { UserRole } from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
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
    strategy: "database", // Use database sessions for immediate access revocation
  },
  callbacks: {
    async signIn({ user, account: _account }) {
      // Auto-assign admin role if email matches ADMIN_EMAIL
      if (user.email === process.env.ADMIN_EMAIL) {
        await connectDB();
        await User.findOneAndUpdate(
          { email: user.email },
          {
            role: 'admin',
            isApproved: true
          },
          { upsert: true, new: true }
        );
      }
      return true;
    },
    async session({ session, user }) {
      // Fetch fresh user data from database to get role and approval status
      await connectDB();
      const dbUser = await User.findOne({ email: session.user.email });

      if (dbUser && session.user) {
        session.user.id = user.id;
        session.user.role = dbUser.role as UserRole;
        session.user.isApproved = dbUser.isApproved;
      }

      return session;
    },
  },
});
