/**
 * Middleware to validate request body before controller runs using Zod validation library
 */
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

// outer function configures middleware
export function validateRequest(schema: z.ZodTypeAny) {
    // returned a function which is the actual middleware
    return function (req: Request, res: Response, next: NextFunction) {
        // validate the request body against schema rules
        // if returns success, result = { success: true, data: validatedData }
        // if returns failure, result = { success: false, error: ...}
        const result = schema.safeParse(req.body);

        // if result is false, request body is invalid, returns 400 bad request
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid request body",
                // format validation errors
                errors: result.error.issues,
            });
        }

        // if request body is valid, replace request body with clean validated data
        req.body = result.data;
        // validation passes, continue to controller
        next();
    }
}