/**
 * Middleware to validate request body before controller runs using Zod validation library
 */
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

type RequestValidationSource = "body" | "query" | "params";

// outer function configures middleware, default is "body"
export function validateRequest(schema: z.ZodTypeAny, source: RequestValidationSource = "body") {
    // returned a function which is the actual middleware
    return function (req: Request, res: Response, next: NextFunction) {
        // validate the request [source] against schema rules
        // if returns success, result = { success: true, data: validatedData }
        // if returns failure, result = { success: false, error: ...}
        const result = schema.safeParse(req[source]);

        // if result is false, request [source] is invalid, returns 400 bad request
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: `Invalid request body ${source}`,
                // format validation errors
                errors: result.error.issues,
            });
        }

        // if request [source] is valid, replace request body with clean validated data
        req[source] = result.data;
        // validation passes, continue to controller
        next();
    };
}