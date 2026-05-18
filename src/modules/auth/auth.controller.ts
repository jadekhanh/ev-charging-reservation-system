/**
 * Auth controller handles HTTP requests/responses for authentication routes
 */
import { Request, Response } from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser,
} from "./auth.service";

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function registerController(req: Request, res: Response) {
    try {
        const user = await registerUser(req.body);

        console.log(`User registered successfully: ${user.email}`);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Error registering user:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to register user",
        });
    }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function loginController(req: Request, res: Response) {
    try {
        const result = await loginUser(req.body);

        console.log(`User logged in successfully: ${result.user.email}`);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Error logging in user:", error);

        return res.status(500).json({
            success: false,
            message: "Incorrect email or password",
        });
    }
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export async function getCurrentUserController(req: Request, res: Response) {
    try {
        const userId = req.user.id;
        const user = getCurrentUser(userId);

        console.log("Successfully fetching current user");

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Error fetching current user", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch current user",
        });
    }
}