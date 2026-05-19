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
import { requireAuth, allowRole } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import { UserRole } from "@prisma/client";
import {
    createStationSchema,
    updateStationSchema,
} from "./stations.schema";

const router = Router();

/**
 * Get all charging stations
 * GET /api/stations
 */
router.get("/", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), asyncHandler(getStationsController));

/**
 * Get all chargers by station id
 * GET /api/stations/:stationId/chargers
 */
router.get("/:stationId/chargers", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), asyncHandler(getChargersByStationController));

/**
 * Get all reservations belonging to a station
 * GET /api/stations/:stationId/reservations
 */
router.get("/:stationId/reservations", requireAuth, allowRole(UserRole.ADMIN), asyncHandler(getReservationsByStationIdController));

/**
 * Get a station by its id
 * GET /api/stations/:id
 */
router.get("/:id", requireAuth, allowRole(UserRole.ADMIN), asyncHandler(getStationByIdController));

/**
 * Create a station
 * POST /api/stations
 */
router.post("/", requireAuth, allowRole(UserRole.ADMIN), validateRequest(createStationSchema), asyncHandler(createStationController));

/**
 * Update station fields by their id
 * PUT /api/stations/:id
 */
router.put("/:id", requireAuth, allowRole(UserRole.ADMIN), validateRequest(updateStationSchema), asyncHandler(updateStationController));

/**
 * Delete a station by its id
 * DELETE /api/stations/:id
 */
router.delete("/:id", requireAuth, allowRole(UserRole.ADMIN), asyncHandler(deleteStationController));

export default router;