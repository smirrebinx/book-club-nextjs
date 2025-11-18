import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";

import { authConfig } from "@/lib/auth.config";
import { createContextLogger } from "@/lib/logger";
import dbConnect from "@/lib/mongodb";
import clientPromise from "@/lib/mongodb-client";
import User from "@/models/User";

import type { UserRole } from "@/models/User";

const logger = createContextLogger('Auth');

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
        logger.debug('JWT callback - Connecting to database...');
        await dbConnect();
        logger.debug('JWT callback - Database connected');

        const email = user?.email || token.email;

        if (!email) {
          logger.error('JWT callback - No email found in user or token');
          return token;
        }

        logger.debug('JWT callback - Fetching user data');
        const dbUser = await User.findOne({ email }).lean();

        if (dbUser) {
          logger.debug('JWT callback - User found, role:', dbUser.role);
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
              logger.info('JWT callback - User was forced to logout');
              return {}; // This will invalidate the session
            }
          }
        } else if (user) {
          // New user - set defaults
          logger.debug('JWT callback - New user, setting defaults');
          token.id = user.id;
          token.email = user.email;

          // SECURITY: ADMIN_EMAIL should only be used for initial setup
          // Check if this is the admin email AND there are no existing admins
          if (user.email === process.env.ADMIN_EMAIL) {
            // Check if any admin already exists in the database
            const existingAdmin = await User.findOne({ role: 'admin' }).lean();

            if (!existingAdmin) {
              // First-time setup: Auto-promote to admin
              logger.info('JWT callback - First admin setup');
              token.role = 'admin';
              token.isApproved = true;
            } else {
              // Admin already exists: ADMIN_EMAIL no longer auto-promotes
              logger.warn('JWT callback - ADMIN_EMAIL ignored (admin already exists)');
              token.role = 'pending';
              token.isApproved = false;
            }
          } else {
            logger.debug('JWT callback - User is pending approval');
            token.role = 'pending';
            token.isApproved = false;
          }
        } else {
          logger.debug('JWT callback - No user found in database or session');
        }

        return token;
      } catch (error) {
        logger.error('JWT callback - Error:', error);
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
