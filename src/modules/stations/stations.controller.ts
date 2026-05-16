/*
Stations controller handles HTTP requests/responses for station routes
*/
import {Request, Response} from "express";
import {
    getAllStations,
    getStationById,
    deleteStation,
    createStation,
    updateStation
} from "./stations.service";

/**
 * GET /api/stations
 * Get all charging stations with their chargers
 */
export async function getStationsController(req: Request, res: Response) {
    try {
        const stations = await getAllStations();

        return res.status(200).json({
            success: true,
            data: stations,
        });

    } catch (error) {
        console.error("Error fetching all charging stations:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch charging stations.",
        });
    }
}

/**
 * GET /api/stations/:id
 * Get a station by its id
 */
export async function getStationByIdController(req: Request, res:Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid charging station id",
            });
        }
        const station = await getStationById(id);

        if (!station) {
            return res.status(404).json({
                success: false,
                message: "Charging station not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: station,
        });

    } catch (error) {
        console.error("Error fetching charging stations:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch charing station",
        });
    }
}

/**
 * Create station
 * POST /api/stations
 */
export async function createStationController(req: Request, res: Response) {
    try {
        const station = await createStation(req.body);

        return res.status(201).json({
            success: true,
            data: station,
        });
    } catch (error) {
        console.error("Error creating charging station:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create charging station",
        });
    }
}

/**
 * Update station fields
 * PUT /api/stations/:id
 */
export async function updateStationController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid charging station id",
            });
        }
        const updatedStation = await updateStation(id, req.body);

        return res.status(200).json({
            success: true,
            data: updatedStation,
        });
    } catch (error) {
        console.error("Error updating charging station:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update charging station",
        });
    }
}


/**
 * Delete a station by its id
 * DELETE /api/stations/:id
 */
export async function deleteStationController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid charging station id",
            });
        }
        await deleteStation(id);

        return res.status(200).json({
            success: true,
            message: "Charging station deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting charging station:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete charging station",
        });
    }
}