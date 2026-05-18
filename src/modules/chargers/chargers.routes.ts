/**
 * Chargers routes creates router for chargers module
 */
import {Router} from "express"
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

const router = Router();

/**
 * Get all chargers
 * GET /api/chargers
 */
router.get("/", getChargersController);

/**
 * Get a charger by its id
 * GET /api/chargers/:id
 */
router.get("/:id", getChargerByIdController);

/**
 * Get all reservations belonging to a charger
 * GET /api/chargers/:chargerId/reservations
 */
router.get("/chargerId/reservations", getReservationsByChargerIdController);

/**
 * Create charger
 * POST /api/chargers
 */
router.post("/", createChargerController);

/**
 * Update charger fields by its id
 * PUT /api/chargers/:id
 */
router.put("/:id", updateChargerController);

/**
 * Delete a charger by its id
 * DELETE /api/chargers/:id
 */
router.delete("/:id", deleteChargerController);

export default router;