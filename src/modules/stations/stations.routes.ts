/**
 * Stations routes creates router for stations module
 */
import {Router} from "express"
import { 
    getStationsController,
    getStationByIdController,
    createStationController,
    updateStationController,
    deleteStationController
 } from "./stations.controller"

const router = Router();

/**
 * Get all charging stations
 * GET /api/stations
 * Get all charging stations
 */
router.get("/", getStationsController);

/**
 * Get a station by its id
 * GET /api/stations:id
 */
router.get("/", getStationByIdController);

/**
 * Create station
 * POST /api/stations
 */
router.post("/", createStationController);

/**
 * Update station fields
 * PUT /api/stations/:id
 */
router.put("/:id", updateStationController);

/**
 * Delete a station by its id
 * DELETE /api/stations/:id
 */
router.delete("/:id", deleteStationController);

export default router;