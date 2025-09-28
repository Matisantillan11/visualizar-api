import { Role } from 'src/shared/database/generated/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  supabaseUserId: string;
}
