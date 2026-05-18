/**
 * Express type declaration file
 * Express only has req.body, req.params, req.header
 */
import { UserRole } from "@prisma/client";

// modify global TypeScript types
declare global {
    // targets Express library types
    namespace Express {
        // specifically modify Express Request interfaces
        interface Request {
            // add custom optional field user to Request interface
            user?: {
                // which includes id and role
                id: string,
                role: UserRole,
            };
        }
    }
}