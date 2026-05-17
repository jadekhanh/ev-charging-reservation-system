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
} from "./users.controller"

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