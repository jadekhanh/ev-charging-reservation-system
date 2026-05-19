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
import { ApiError } from "../../utils/ApiError";

/**
 * Get all charging stations with their chargers
 * GET /api/stations
 */
export async function getStationsController(req: Request, res: Response) {
    const stations = await getAllStations();

    return res.status(200).json({
        success: true,
        data: stations,
    });
}

/**
 * Get a station by its id
 * GET /api/stations/:id
 */
export async function getStationByIdController(req: Request, res:Response) {
    // check if station id is valid
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid charging station id");
    }
    // check if a station with this id exists
    const station = await getStationById(id);
    if (!station) {
        throw new ApiError(404, "Charging station not found");
    }

    return res.status(200).json({
        success: true,
        data: station,
    });
}

/**
 * Create a station
 * POST /api/stations
 */
export async function createStationController(req: Request, res: Response) {
    const station = await createStation(req.body);

    return res.status(201).json({
        success: true,
        data: station,
    });
}

/**
 * Update a station fields
 * PUT /api/stations/:id
 */
export async function updateStationController(req: Request, res: Response) {
    // check if station id is valid
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid charging station id");
    }
    // check if station exists
    const station = await getStationById(id);
    if (!station) {
        throw new ApiError(404, "Charging station not found");
    }

    const updatedStation = await updateStation(id, req.body);

    return res.status(200).json({
        success: true,
        data: updatedStation,
    });
}


/**
 * Delete a station by its id
 * DELETE /api/stations/:id
 */
export async function deleteStationController(req: Request, res: Response) {
    // check if station id is valid
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid charging station id");
    }
    // check if station exists
    const station = await getStationById(id);
    if (!station) {
        throw new ApiError(404, "Charging station not found");
    }
    
    await deleteStation(id);

    return res.status(200).json({
        success: true,
        message: "Charging station deleted successfully",
    });
}