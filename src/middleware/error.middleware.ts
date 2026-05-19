import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

export function errorHandler(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    console.error("Error", error);

    // handles API errors
    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    // handles generic Prisma database errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // handles duplicated value errors
        if (error.code == "P2002") {
            return res.status(409).json({
                success: false,
                message: "Duplicate value already exists",
            });
        }

        // handles error Prisma could not find request record
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Record not found",
            });
        }
    }

    // other 500 errors
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    })
}