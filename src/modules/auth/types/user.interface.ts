import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  supabaseUserId: string;
}

export interface JwtError {
  name: string;
  message: string;
}
