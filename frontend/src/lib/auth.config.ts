import type { NextAuthConfig } from "next-auth";

// This config is used in middleware (edge-compatible, no database adapter)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnSignIn = nextUrl.pathname.startsWith("/auth/signin");
      const isOnPending = nextUrl.pathname.startsWith("/auth/pending");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnSuggestions = nextUrl.pathname.startsWith("/suggestions");

      // Allow signin page access only for non-authenticated users
      if (isOnSignIn) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Must be logged in for all other pages
      if (!isLoggedIn) {
        return false;
      }

      // Pending page is accessible to all authenticated users
      if (isOnPending) {
        return true;
      }

      // Admin and suggestions routes require authentication (role checks done in components)
      // This middleware only handles authentication, not authorization
      if (isOnAdmin || isOnSuggestions) {
        return true;
      }

      return true; // Allow access for authenticated users
    },
  },
  providers: [], // Providers are added in auth.ts
};
