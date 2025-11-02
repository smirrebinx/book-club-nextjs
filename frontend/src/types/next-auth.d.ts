import type { UserRole } from "@/models/User";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isApproved: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    isApproved?: boolean;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role?: UserRole;
    isApproved?: boolean;
  }
}
