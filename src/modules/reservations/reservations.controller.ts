/**
 * Reservations controller handles HTTP requests/responses for reservations routes
 */
import {Request, Response} from "express"
import {
    getAllReservations,
    getReservationsByStationId,
    getReservationsByUserId,
    getReservationsByChargerId,
    getReservationById,
    deleteReservation,
    updateReservation,
    cancelReservation,
    createReservationHold,
    confirmReservation,
} from "./reservations.service";
import { ApiError } from "../../utils/ApiError";
import { UserRole } from "@prisma/client";

/**
 * Get all reservations
 * GET /api/reservations
 */
export async function getReservationsController(req: Request, res: Response) {
    const reservations = await getAllReservations();

    return res.status(200).json({
        success: true,
        data: reservations,
    });
}

/**
 * Get current user's reservations
 * GET /api/reservations/me
 */
export async function getMyReservationsController(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, "Authentication required");
    }

    const reservations = await getReservationsByUserId(userId);

    return res.status(200).json({
        success: true,
        data: reservations,
    });
}

/**
 * Get all reservations belonging to a station
 * GET /api/stations/:stationId/reservations
 */
export async function getReservationsByStationIdController(req: Request, res: Response) {
    const {stationId} = req.params;
    if (typeof stationId !== "string") {
        throw new ApiError(400, "Invalid station id");
    }
    const reservations = await getReservationsByStationId(stationId);

    return res.status(200).json({
        success: true,
        data: reservations,
    });
}

/**
 * Get all reservations belonging to a user
 * GET /api/users/:userId/reservations
 */
export async function getReservationsByUserIdController(req: Request, res: Response) {
    const {userId} = req.params;
    if (typeof userId !== "string") {
        throw new ApiError(400, "Invalid user id");
    }
    const reservations = await getReservationsByUserId(userId);

    return res.status(200).json({
        success: true,
        data: reservations,
    });
}

/**
 * Get all reservations belonging to a charger
 * GET /api/chargers/:chargerId/reservations
 */
export async function getReservationsByChargerIdController(req: Request, res: Response) {
    const {chargerId} = req.params;
    if (typeof chargerId !== "string") {
        throw new ApiError(400, "Invalid charger id");
    }
    const reservations = await getReservationsByChargerId(chargerId);

    return res.status(200).json({
        success: true,
        data: reservations,
    });
}

/**
 * Get a reservation by its id
 * GET /api/reservations/:id
 */
export async function getReservationByIdController(req: Request, res: Response) {
    // check if user id is valid
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid reservation id");
    }
    // check if reservation exists
    const reservation = await getReservationById(id);
    if (!reservation) {
        throw new ApiError(404, "Reservation not found");
    }
    // check if this user is a customer and is the customer assigned to current reservation
    if (
        req.user?.role === UserRole.CUSTOMER &&
        reservation.userId !== req.user.id
    ) {
        throw new ApiError(403, "Do not have permission to access this reservation");
    }

    return res.status(200).json({
        success: true,
        data: reservation,
    });
}

/**
 * Update reservation fields
 * PUT /api/reservations/:id
 */
export async function updateReservationController(req: Request, res: Response) {
    // check if user id is valid
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid reservation id");
    }
    // check if reservation exists
    const reservation = await getReservationById(id);
    if (!reservation) {
        throw new ApiError(404, "Reservation not found");
    }
    // check if this user is a customer not assigned to this reservation
    if (
        req.user?.role === UserRole.CUSTOMER &&
        reservation.userId !== req.user.id
    ) {
        throw new ApiError(403, "Do not have permission to access this reservation");
    }

    const updatedReservation = await updateReservation(id, req.body);

    return res.status(200).json({
        success: true,
        data: updatedReservation,
    });
}

/**
 * Delete a reservation by its id
 * DELETE /api/reservations/:id
 */
export async function deleteReservationController(req: Request, res: Response) {
    // check if user id is valid
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid reservation id");
    }
    await deleteReservation(id);

    return res.status(200).json({
        success: true,
        message: "Reservation deleted successfully",
    });
}

/**
 * Cancel a reservation by its id
 * POST /api/reservations/:id/cancel
 */
export async function cancelReservationController(req: Request, res: Response) {
    // check if user id is valid
    const {id} = req.params;
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid reservation id");
    }
    // check if reservation exists
    const reservation = await getReservationById(id);
    if (!reservation) {
        throw new ApiError(404, "Reservation not found");
    }
    // check if this user is a customer not assigned to this reservation
    if (
        req.user?.role === UserRole.CUSTOMER &&
        reservation.userId !== req.user.id
    ) {
        throw new ApiError(403, "Do not have permission to access this reservation");
    }
    const cancelledReservation = await cancelReservation(id);

    return res.status(200).json({
        success: true,
        data: cancelledReservation,
    });
}

/**
 * Create a reservation hold by its id
 * POST /api/reservations/hold
 */
export async function createReservationHoldController(req: Request, res: Response) {
    const reservation = await createReservationHold(req.body);

    return res.status(201).json({
        success: true,
        data: reservation,
    });
}

/**
 * Confirm a reservation by its id
 * POST /api/reservations/confirm
 */
export async function confirmReservationController(req: Request, res: Response) {
    const reservation = await confirmReservation(req.body);

    return res.status(201).json({
        success: true,
        data: reservation,
    });
}