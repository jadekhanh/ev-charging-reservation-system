/**
 * Chargers controller handles HTTP requests/responses for charger routes
 */
import {Request, Response} from "express"
import {
    getAllChargers,
    getChargersByStationId,
    getChargerById,
    deleteCharger,
    createCharger,
    updateCharger,
} from "./chargers.service";

/**
 * Get all chargers
 * GET /api/chargers
 */
export async function getChargersController(req: Request, res: Response) {
    try {
        const chargers = await getAllChargers();

        return res.status(200).json({
            success: true,
            data: chargers,
        });
    } catch (error) {
        console.error("Error fetching all chargers:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch all chargers.",
        });
    }
}

/**
 * Get all chargers belonging to a station
 * GET /api/stations/:stationId/chargers
 */
export async function getChargersByStationController(req: Request, res: Response) {
    try {
        const {stationId} = req.params;
        if (typeof stationId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid station id",
            });
        }
        const chargers = await getChargersByStationId(stationId);

        return res.status(200).json({
            success: true,
            data: chargers,
        });
    } catch (error) {
        console.error("Error fetching all chargers for station:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch all chargers for station.",
        });
    }
}

/**
 * Get a charger by its id
 * GET /api/chargers/:id
 */
export async function getChargerByIdController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid charger id",
            });
        }
        const charger = await getChargerById(id);
        if (!charger) {
            return res.status(404).json({
                success: false,
                message: "Charger not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: charger
        });
    } catch (error) {
        console.error("Error fetching charger:", error)
        
        return res.status(500).json({
            success: false,
            message: "Failed to fetch charger",
        });
    }
}

/**
 * Create a charger
 * POST /api/chargers
 */
export async function createChargerController(req: Request, res: Response) {
    try {
        const charger = await createCharger(req.body);

        return res.status(201).json({
            success: true,
            data: charger,
        });
    } catch (error) {
        console.error("Error creating charger:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to create charger",
        });
    }
}

/**
 * Update charger fields
 * PUT /api/chargers/:id
 */
export async function updateChargerController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid charger id",
            });
        }
        const updatedCharger = await updateCharger(id, req.body);

        return res.status(200).json({
            success: true,
            data: updatedCharger,
        });
    } catch (error) {
        console.error("Error updating charger", error)

        return res.status(500).json({
             success: false,
             message: "Failed to update charger",
        });
    }
}

/**
 * Delete a charger by its id
 * DELETE /api/chargers/:id
 */
export async function deleteChargerController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid charger id",
            });
        }
        await deleteCharger(id);

        return res.status(200).json({
            success: true,
            message: "Charger deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting charger:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to delete charger",
        });
    }
}