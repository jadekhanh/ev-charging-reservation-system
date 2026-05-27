/**
 * Availability routes creates router for availability module
 */
import { Router } from "express";
import {
    getAvailableChargersController,
    getAvailableTimeSlotsController,
    getAvailableStationsController,
} from "./availability.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { 
    findAvailableStationsSchema,
    findAvailableChargersSchema,
    findAvailableTimeSlotsSchema,
} from "./availability.schema";

const router = Router();

/**
 * Get all stations that have at least 1 available charger for a requested time slot
 * GET /api/availability/stations?startTime=...&endTime=...
 */
router.get("/stations", requireAuth, validateRequest(findAvailableStationsSchema, "query"), asyncHandler(getAvailableStationsController));

/**
 * Get all available chargers at a station that do not have overlapping reservations
 * GET /api/availability/chargers?stationId=...&startTime=...&endTime=...
 */
router.get("/chargers", requireAuth, validateRequest(findAvailableChargersSchema, "query"), asyncHandler(getAvailableChargersController));

/**
 * Get available time slots for a charger on a specific date
 * GET /api/availability/slots?chargerId=...&date=...
 */
router.get("/slots", requireAuth, validateRequest(findAvailableTimeSlotsSchema, "query"), asyncHandler(getAvailableTimeSlotsController));

export default router;