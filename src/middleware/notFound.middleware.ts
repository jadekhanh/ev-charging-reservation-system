/**
 * Middleware for handling unknown routes
 */
import { Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
    // request reache here because no route matched
    return res.status(404).json({
        success: false,
        // method: GET, POST, PUT, DELETE
        // originalUrl = API route
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}