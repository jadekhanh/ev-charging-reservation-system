/**
 * Reservation routes creates router for reservations module
 */
import {Router} from "express"
import {
    getReservationsController,
    getMyReservationsController,
    getReservationByIdController,
    updateReservationController,
    deleteReservationController,
    cancelReservationController,
    createReservationHoldController,
    confirmReservationController,
} from "./reservations.controller"
import { requireAuth, allowRole } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import { UserRole } from "@prisma/client";
import {
    confirmReservationSchema,
    createReservationHoldSchema,
    updateReservationSchema,
} from "./reservations.schema";

const router = Router();

/**
 * Get all reservations
 * GET /api/reservations
 */
router.get("/", requireAuth, allowRole(UserRole.ADMIN), asyncHandler(getReservationsController));

/**
 * Get current user's reservations
 * GET /api/reservations/me
 */
router.get("/me", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), asyncHandler(getMyReservationsController));

/**
 * Create a reservation hold
 * POST /api/reservations/hold
 */
router.post("/hold", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), validateRequest(createReservationHoldSchema), asyncHandler(createReservationHoldController));

/**
 * Confirm a reservation
 * POST /api/reservations/confirm
 */
router.post("/confirm", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), validateRequest(confirmReservationSchema), asyncHandler(confirmReservationController));

/**
 * Get a reservation by its id
 * GET /api/reservations/:id
 */
router.get("/:id", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), asyncHandler(getReservationByIdController));

/**
 * Update reservation fields by its id
 * PUT /api/reservations/:id
 */
router.put("/:id", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), validateRequest(updateReservationSchema), asyncHandler(updateReservationController));

/**
 * Cancel a reservation by its id
 * POST /api/reservations/:id/cancel
 */
router.post("/:id/cancel", requireAuth, allowRole(UserRole.ADMIN, UserRole.CUSTOMER), asyncHandler(cancelReservationController));

/**
 * Delete a reservation by its id
 * DELETE /api/reservations/:id
 */
router.delete("/:id", requireAuth, allowRole(UserRole.ADMIN), asyncHandler(deleteReservationController));

export default router;