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
import { ApiError } from "../../utils/ApiError";

/**
 * Get all chargers
 * GET /api/chargers
 */
export async function getChargersController(req: Request, res: Response) {
    const chargers = await getAllChargers();

    return res.status(200).json({
        success: true,
        data: chargers,
    });
}

/**
 * Get all chargers belonging to a station
 * GET /api/stations/:stationId/chargers
 */
export async function getChargersByStationController(req: Request, res: Response) {
    const {stationId} = req.params;
    if (typeof stationId !== "string") {
        throw new ApiError(400, "Invalid station id");
    }
    const chargers = await getChargersByStationId(stationId);

    return res.status(200).json({
        success: true,
        data: chargers,
    });
}

/**
 * Get a charger by its id
 * GET /api/chargers/:id
 */
export async function getChargerByIdController(req: Request, res: Response) {
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid charger id");
    }
    const charger = await getChargerById(id);
    if (!charger) {
        throw new ApiError(404, "Charger not found");
    }
    return res.status(200).json({
        success: true,
        data: charger
    });
}

/**
 * Create a charger
 * POST /api/chargers
 */
export async function createChargerController(req: Request, res: Response) {
    const charger = await createCharger(req.body);

    return res.status(201).json({
        success: true,
        data: charger,
    });
}

/**
 * Update charger fields
 * PUT /api/chargers/:id
 */
export async function updateChargerController(req: Request, res: Response) {
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid charger id");
    }
    const updatedCharger = await updateCharger(id, req.body);

    return res.status(200).json({
        success: true,
        data: updatedCharger,
    });
}

/**
 * Delete a charger by its id
 * DELETE /api/chargers/:id
 */
export async function deleteChargerController(req: Request, res: Response) {
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid charger id");
    }
    await deleteCharger(id);

    return res.status(200).json({
        success: true,
        message: "Charger deleted successfully",
    });
}