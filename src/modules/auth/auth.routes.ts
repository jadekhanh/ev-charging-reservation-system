/**
 * Auth routes creates router for auth module
 */
import { Router } from "express"
import {
    registerController,
    loginController,
    getCurrentUserController,
} from "./auth.controller";
import { requireAuth, allowRole } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import { UserRole } from "@prisma/client";
import {
    registerSchema,
    loginSchema,
} from "./auth.schema";

const router = Router();

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post("/register", validateRequest(registerSchema), asyncHandler(registerController));

/**
 * Login user
 * POST /api/auth/login
 */
router.post("/login", validateRequest(loginSchema), asyncHandler(loginController));

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
router.get("/me", requireAuth, asyncHandler(getCurrentUserController));

export default router;