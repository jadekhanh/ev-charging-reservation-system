/**
 * Stations routes creates router for stations module
 */
import {Router} from "express"
import { 
    getStationsController,
    getStationByIdController,
    createStationController,
    updateStationController,
    deleteStationController,
 } from "./stations.controller";
import {
    getChargersByStationController,
} from "../chargers/chargers.controller";
import {
    getReservationsByStationIdController,
} from "../reservations/reservations.controller";

const router = Router();

/**
 * Get all charging stations
 * GET /api/stations
 */
router.get("/", getStationsController);

/**
 * Get a station by its id
 * GET /api/stations/:id
 */
router.get("/:id", getStationByIdController);

/**
 * Get all chargers by station id
 * GET /api/stations/:stationId/chargers
 */
router.get("/:stationId/chargers", getChargersByStationController);

/**
 * Get all reservations belonging to a station
 * GET /api/stations/:stationId/reservations
 */
router.get("/:stationId/reservations", getReservationsByStationIdController);

/**
 * Create station
 * POST /api/stations
 */
router.post("/", createStationController);

/**
 * Update station fields by their id
 * PUT /api/stations/:id
 */
router.put("/:id", updateStationController);

/**
 * Delete a station by its id
 * DELETE /api/stations/:id
 */
router.delete("/:id", deleteStationController);

export default router;