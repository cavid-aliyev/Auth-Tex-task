import { User } from "../entities/auth.entity";

export interface LoginResponse {
  success: boolean;
  user: Omit<User, "password">;
  jwt: string;
}
