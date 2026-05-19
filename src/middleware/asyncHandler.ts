import { NextFunction, Request, Response } from "express";

/**
 * Automatically catches async controller errors so we don't need try/catch block in every controller
 * @param controller 
 * @returns 
 */
export function asyncHandler(
    // accepts async Express controller function
    // Promise = future result of an async function
    controller: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
    // returns actual middleware function Express executes
    return function (req: Request, res: Response, next: NextFunction) {
        // If controller throws error, send error into Express error middleware
        // next(error) = skip normal flow and jump directly to error middleware, so errorHandler gets called automatically
        // controller(req, res, next) = runs async controller, which returns a Promise type result
        // when controller throws error, next(error) is called to find middleware with 4 params (error, req, res, next), which is errorHandler(error, req, res, next)
        // hence this is alternative to try/catch block
        Promise.resolve(controller(req, res, next)).catch(next);
    }
}