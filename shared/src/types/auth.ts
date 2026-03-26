import { z } from "zod";
import { userSchema } from "./users";

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const registerRequestSchema = z.object({
  email: z.email(),
  username: z.string().min(2).max(50),
  password: z.string().min(8),
});

export const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
