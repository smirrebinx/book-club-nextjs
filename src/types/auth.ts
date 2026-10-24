import type { UserRole } from '@/models/User';

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
  isApproved: boolean;
}

export interface ExtendedSession {
  user: SessionUser;
  expires: string;
}
