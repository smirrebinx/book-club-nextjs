import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";

import { authConfig } from "@/lib/auth.config";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

import type { UserRole } from "@/models/User";

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
      // On signin or update, fetch/create user in database
      if (user || trigger === 'update') {
        console.log('[Auth JWT] Processing token for user:', user?.email || token.email);
        await dbConnect();

        const email = user?.email || token.email as string;

        if (!email) {
          console.error('[Auth JWT] No email found in user or token');
          return token;
        }

        let dbUser = await User.findOne({ email }).lean();

        if (!dbUser && user) {
          // New user - create in database
          console.log('[Auth JWT] Creating new user:', email);
          const isAdmin = email === process.env.ADMIN_EMAIL;

          try {
            const newUser = await User.create({
              name: user.name || '',
              email: email,
              image: user.image || '',
              role: isAdmin ? 'admin' : 'pending',
              isApproved: isAdmin,
            });

            dbUser = newUser.toObject();
            console.log('[Auth JWT] User created successfully:', dbUser._id);
          } catch (error) {
            console.error('[Auth JWT] Error creating user:', error);
            // If user creation fails, still allow login with defaults
            token.id = user.id || email;
            token.email = email;
            token.role = email === process.env.ADMIN_EMAIL ? 'admin' : 'pending';
            token.isApproved = email === process.env.ADMIN_EMAIL;
            return token;
          }
        }

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
              console.log('[Auth JWT] User was forced to logout, invalidating token');
              return {}; // This will invalidate the session
            }
          }

          console.log('[Auth JWT] Token updated successfully for user:', token.id);
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
