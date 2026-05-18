/**
 * Reservation routes creates router for users module
 */
import {Router} from "express"
import {
    getReservationsController,
    getReservationByIdController,
    updateReservationController,
    deleteReservationController,
    cancelReservationController,
    createReservationHoldController,
    confirmReservationController,
} from "./reservations.controller"

const router = Router();

/**
 * Get all reservations
 * GET /api/reservations
 */
router.get("/", getReservationsController);

/**
 * Confirm a reservation
 * POST /api/reservations/confirm
 */
router.post("/confirm", confirmReservationController);

/**
 * Create a reservation hold
 * POST /api/reservations/hold
 */
router.post("/hold", createReservationHoldController);

/**
 * Get a reservation by its id
 * GET /api/reservations/:id
 */
router.get("/:id", getReservationByIdController);

/**
 * Update reservation fields by its id
 * PUT /api/reservations/:id
 */
router.put("/:id", updateReservationController);

/**
 * Cancel a reservation by its id
 * POST /api/reservations/:id/cancel
 */
router.post("/:id/cancel", cancelReservationController);

/**
 * Delete a reservation by its id
 * DELETE /api/reservations/:id
 */
router.delete("/:id", deleteReservationController);

export default router;