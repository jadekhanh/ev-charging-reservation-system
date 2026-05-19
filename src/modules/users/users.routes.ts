/**
 * Users routes creates router for users module
 */
import {Router} from "express"
import {
    getUsersController,
    getUserByIdController,
    createUserController,
    updateUserController,
    deleteUserController,
} from "./users.controller";
import {
    getReservationsByUserIdController,
} from "../reservations/reservations.controller";
import { requireAuth, allowRole } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import { UserRole } from "@prisma/client";
import {
    createUserSchema,
    updateUserSchema,
} from "./users.schema";

const router = Router();

/**
 * Get all users
 * GET /api/users
 */
router.get("/", requireAuth, allowRole(UserRole.ADMIN), asyncHandler(getUsersController));

/**
 * Get all reservations belonging to a user
 * GET /api/users/:userId/reservations
 */
router.get("/:userId/reservations", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), asyncHandler(getReservationsByUserIdController));

/**
 * Get a user by their id
 * GET /api/users/:id
 */
router.get("/:id", requireAuth, allowRole(UserRole.ADMIN), asyncHandler(getUserByIdController));

/**
 * Create user
 * POST /api/users
 */
router.post("/", requireAuth, allowRole(UserRole.ADMIN), validateRequest(createUserSchema), asyncHandler(createUserController));

/**
 * Update user fields by their id
 * PUT /api/users/:id
 */
router.put("/:id", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), validateRequest(updateUserSchema),asyncHandler(updateUserController));

/**
 * Delete a user by their id
 * DELETE /api/users/:id
 */
router.delete("/:id", requireAuth, allowRole(UserRole.ADMIN), asyncHandler(deleteUserController));

export default router;