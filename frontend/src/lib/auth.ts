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
    async signIn({ user }) {
      // Auto-assign admin role if email matches ADMIN_EMAIL
      if (user.email === process.env.ADMIN_EMAIL) {
        await connectDB();

        // Update both the adapter's user collection and our Mongoose User model
        const client = await clientPromise;
        const db = client.db();

        // Update adapter's users collection (used by NextAuth for sessions)
        await db.collection('users').updateOne(
          { email: user.email },
          {
            $set: {
              role: 'admin',
              isApproved: true,
            }
          }
        );

        // Also update our Mongoose User model for consistency
        await User.findOneAndUpdate(
          { email: user.email },
          {
            role: 'admin',
            isApproved: true
          },
          { upsert: true, new: true }
        );
      } else {
        // For non-admin users, ensure they exist in Mongoose with default values
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create in Mongoose with pending status
          await User.create({
            email: user.email,
            name: user.name,
            role: 'pending',
            isApproved: false
          });

          // Update adapter's collection to include our custom fields
          const client = await clientPromise;
          const db = client.db();
          await db.collection('users').updateOne(
            { email: user.email },
            {
              $set: {
                role: 'pending',
                isApproved: false,
              }
            }
          );
        }
      }
      return true;
    },
    async session({ session, user }) {
      // The user object from database sessions already has fresh data
      // Add our custom fields to the session
      if (session.user) {
        session.user.id = user.id;

        // Get role and isApproved from the adapter's user object
        // The adapter pulls this from the database on each request
        session.user.role = (user as any).role || 'pending';
        session.user.isApproved = (user as any).isApproved || false;
      }

      return session;
    },
  },
});
