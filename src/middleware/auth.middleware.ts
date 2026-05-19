/**
 * Auth middleware verifies JWT token and attaches user to request
 */
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";

/**
 * JWT payload input type
 */
type JWTPayload = {
    userId: string;
    role: UserRole;
};

/**
 * Protects routes that require login
 * Is this user logged in?
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        // read Authorization header from the request
        // expected format: Authorization: Bearer <token>
        const authHeader = req.headers.authorization;

        // check if the header is missing or incorrectly formatted
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Missing or invalid authorization token",
            });
        }

        // extract <token> from Authorization header
        const token = authHeader.split(" ")[1];
        
        // read secret key from env.ts
        const secret = env.JWT_SECRET;

        // check if the secret key is missing
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }

        // backend verifies the token using the secret key
        // checks if this token is signed by this backend, if it expires, and if it's changed/tampered with
        // if valid, return as payload
        const decoded = jwt.verify(token, secret) as JWTPayload;

        // attach user to the request
        req.user = {
            id: decoded.userId,
            role: decoded.role,
        };

        // authorization passes, continue to next middleware/controller
        next();

    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}

/**
 * Protect routes that allow specific roles
 * Is this user allowed to do this action?
 */
export function allowRole(...allowedRoles: UserRole[]) {

    // returns the actual middleware function
    return function (req: Request, res: Response, next: NextFunction) {

        // if requireAuth() did not run before this, then there's no logged-in user attached to request
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // check if this user is included in the list of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Do not have permission to access",
            });
        }

        // authorization passes, continue to next middleware/controller
        next();
    };
}