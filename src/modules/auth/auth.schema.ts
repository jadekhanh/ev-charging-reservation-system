import { z } from "zod";
import { UserRole } from "@prisma/client";

/**
 * Schema for register user
 * All fields are required, except for role, and must match their data type
 */
export const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(8), // must at least have 8 chars
    role: z.enum(UserRole).optional(),
});

/**
 * Schema for login user
 * All fields are required and must match their data type
 */
export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8), // must at least have 8 chars
}) 
