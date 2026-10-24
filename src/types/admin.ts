import type { UserRole } from '@/models/User';

export interface UserManagement {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}
