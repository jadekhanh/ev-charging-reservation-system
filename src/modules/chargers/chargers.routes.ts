/**
 * Chargers routes creates router for chargers module
 */
import { Router } from "express"
import {
    getChargersController,
    getChargerByIdController,
    createChargerController,
    updateChargerController,
    deleteChargerController,
} from "./chargers.controller"
import {
    getReservationsByChargerIdController,
} from "../reservations/reservations.controller"
import { requireAuth, allowRole } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import { UserRole } from "@prisma/client";
import {
    createChargerSchema,
    updateChargerSchema,
} from "./chargers.schema";

const router = Router();

/**
 * Get all chargers
 * GET /api/chargers
 */
router.get("/", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), asyncHandler(getChargersController));

/**
 * Get all reservations belonging to a charger
 * GET /api/chargers/:chargerId/reservations
 */
router.get("/:chargerId/reservations", requireAuth, allowRole(UserRole.ADMIN), asyncHandler(getReservationsByChargerIdController));

/**
 * Get a charger by its id
 * GET /api/chargers/:id
 */
router.get("/:id", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), asyncHandler(getChargerByIdController));

/**
 * Create a charger
 * POST /api/chargers
 */
router.post("/", requireAuth, allowRole(UserRole.ADMIN), validateRequest(createChargerSchema), asyncHandler(createChargerController));

/**
 * Update charger fields by its id
 * PUT /api/chargers/:id
 */
router.put("/:id", requireAuth, allowRole(UserRole.ADMIN), validateRequest(updateChargerSchema), asyncHandler(updateChargerController));

/**
 * Delete a charger by its id
 * DELETE /api/chargers/:id
 */
router.delete("/:id", requireAuth, allowRole(UserRole.ADMIN), asyncHandler(deleteChargerController));

export default router;