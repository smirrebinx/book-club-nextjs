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

      if (isOnSignIn) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true; // Allow access to signin page
      }

      return isLoggedIn; // Redirect to signin if not logged in
    },
  },
  providers: [], // Providers are added in auth.ts
};
