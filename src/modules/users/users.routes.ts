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

const router = Router();

/**
 * Get all users
 * GET /api/users
 */
router.get("/", getUsersController);

/**
 * Get a user by their id
 * GET /api/users/:id
 */
router.get("/:id", getUserByIdController);

/**
 * Get all reservations belonging to a user
 * GET /api/users/:userId/reservations
 */
router.get("/userId/reservations", getReservationsByUserIdController);

/**
 * Create user
 * POST /api/users
 */
router.post("/", createUserController);

/**
 * Update user fields by their id
 * PUT /api/users/:id
 */
router.put("/:id", updateUserController);

/**
 * Delete a user by their id
 * DELETE /api/users/:id
 */
router.delete("/:id", deleteUserController);

export default router;