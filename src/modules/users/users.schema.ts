import { z } from "zod";
import { UserRole } from "@prisma/client";

/**
 * Schema for creating user
 * All fields are required except for role
 */
export const createUserSchema = z.object({
    // has to be an email
    email: z.email(),
    // password has to be a string with min len of 8
    password: z.string().min(8),
    // role has to be UserRole type and can be optional
    role: z.enum(UserRole).optional(),
});

/**
 * Schema for updating user
 * All fields are optional
 */
export const updateUserSchema = createUserSchema.partial();