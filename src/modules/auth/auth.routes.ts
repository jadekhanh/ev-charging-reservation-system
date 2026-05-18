/**
 * Auth routes creates router for auth module
 */
import { Router } from "express"
import {
    registerController,
    loginController,
    getCurrentUserController,
} from "./auth.controller";

const router = Router();

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post("/register", registerController);

/**
 * Login user
 * POST /api/auth/login
 */
router.post("/login", loginController);

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
router.get("/me", getCurrentUserController);

export default router;