import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  username: z.string(),
  avatar: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const userResponseSchema = userSchema;

export type User = z.infer<typeof userSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
