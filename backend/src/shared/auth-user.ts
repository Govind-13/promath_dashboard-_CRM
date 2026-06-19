import { UserRole } from "../modules/users/user.schema";

export interface AuthUser {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthRequest {
  user: AuthUser;
}
