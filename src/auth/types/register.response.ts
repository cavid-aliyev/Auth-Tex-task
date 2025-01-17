import { User } from "../entities/auth.entity";

export interface RegisterResponse {
  success: boolean;
  user: Omit<User, "password">;
  jwt: string;
}
