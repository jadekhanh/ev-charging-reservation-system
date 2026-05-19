/**
 * Users controller handles HTTP requests/responses for users routes
 */
import {Request, Response} from "express"
import {
    getAllUsers,
    getUserById,
    deleteUser,
    createUser,
    updateUser,
} from "./users.service";
import { ApiError } from "../../utils/ApiError";

/**
 * Get all users
 * GET /api/users
 */
export async function getUsersController(req: Request, res: Response) {
    const users = await getAllUsers();

    return res.status(200).json({
        success: true,
        data: users,
    });
}

/**
 * Get a user by their id
 * GET /api/users/:id
 */
export async function getUserByIdController(req: Request, res: Response) {
    // check if user id is valid
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid user id");
    }
    // check if user exists
    const user = await getUserById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json({
        success: true,
        data: user
    });
}

/**
 * Create a user
 * POST /api/users
 */
export async function createUserController(req: Request, res: Response) {
    const user = await createUser(req.body);

    return res.status(201).json({
        success: true,
        data: user,
    });
}

/**
 * Update user fields
 * PUT /api/users/:id
 */
export async function updateUserController(req: Request, res: Response) {
    // check if user id is valid
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid user id");
    }
    // check if user exists
    const user = await getUserById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const updatedUser = await updateUser(id, req.body);

    return res.status(200).json({
        success: true,
        data: updatedUser,
    });
}

/**
 * Delete a user by their id
 * DELETE /api/users/:id
 */
export async function deleteUserController(req: Request, res: Response) {
    // check if user id is valid
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid user id");
    }
    // check if user exists
    const user = await getUserById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await deleteUser(id);

    return res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
}