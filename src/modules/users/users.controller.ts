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

/**
 * Get all users
 * GET /api/users
 */
export async function getUsersController(req: Request, res: Response) {
    try {
        const users = await getAllUsers();

        return res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error("Error fetching all users:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch all users.",
        });
    }
}

/**
 * Get a user by their id
 * GET /api/users/:id
 */
export async function getUserByIdController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }
        const user = await getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Error fetching user:", error)
        
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
}

/**
 * Create a user
 * POST /api/users
 */
export async function createUserController(req: Request, res: Response) {
    try {
        const user = await createUser(req.body);

        return res.status(201).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Error creating user:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to create user",
        });
    }
}

/**
 * Update user fields
 * PUT /api/users/:id
 */
export async function updateUserController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }
        const updatedUser = await updateUser(id, req.body);

        return res.status(200).json({
            success: true,
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user", error)

        return res.status(500).json({
             success: false,
             message: "Failed to update user",
        });
    }
}

/**
 * Delete a user by their id
 * DELETE /api/users/:id
 */
export async function deleteUserController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }
        await deleteUser(id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to delete user",
        });
    }
}