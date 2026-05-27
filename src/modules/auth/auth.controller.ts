/**
 * Auth controller handles HTTP requests/responses for authentication routes
 */
import { Request, Response } from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser,
} from "./auth.service";
import { ApiError } from "../../utils/ApiError";

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function registerController(req: Request, res: Response) {
    const user = await registerUser(req.body);

    console.log(`User registered successfully: ${user.email}`);

    return res.status(201).json({
        success: true,
        data: user,
    });
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function loginController(req: Request, res: Response) {
    const result = await loginUser(req.body);

    console.log(`User logged in successfully: ${result.user.email}`);

    return res.status(200).json({
        success: true,
        data: {
            user: result.user,
            token: result.token,
        }
    });
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export async function getCurrentUserController(req: Request, res: Response) {
    const userId = req.user?.id;
    // check if user is authenticated
    if (!userId) {
        throw new ApiError(401, "Authentication required");
    }
    const user = await getCurrentUser(userId);
    // check if user exists in database
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    console.log("Successfully fetched current user");

    return res.status(200).json({
        success: true,
        data: user,
    });
}