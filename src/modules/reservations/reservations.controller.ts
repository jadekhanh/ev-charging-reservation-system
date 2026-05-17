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

/**
 * Get all reservations
 * GET /api/reservations
 */
export async function getReservationsController(req: Request, res: Response) {
    try {
        const reservations = await getAllReservations();

        return res.status(200).json({
            success: true,
            data: reservations,
        });
    } catch (error) {
        console.error("Error fetching all reservations:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch all reservations.",
        });
    }
}

/**
 * Get all reservations belonging to a station
 * GET /api/stations/:stationId/reservations
 */
export async function getReservationsByStationIdController(req: Request, res: Response) {
    try {
        const {stationId} = req.params;
        if (typeof stationId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid station id",
            });
        }
        const reservations = await getReservationsByStationId(stationId);

        return res.status(200).json({
            success: true,
            data: reservations,
        });
    } catch (error) {
        console.error("Error fetching all reservations for station:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch all reservations for station.",
        });
    }
}

/**
 * Get all reservations belonging to a user
 * GET /api/users/:userId/reservations
 */
export async function getReservationsByUserIdController(req: Request, res: Response) {
    try {
        const {userId} = req.params;
        if (typeof userId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }
        const reservations = await getReservationsByUserId(userId);

        return res.status(200).json({
            success: true,
            data: reservations,
        });
    } catch (error) {
        console.error("Error fetching all reservations for user:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch all reservations for user.",
        });
    }
}

/**
 * Get all reservations belonging to a charger
 * GET /api/chargers/:chargerId/reservations
 */
export async function getReservationsByChargerIdController(req: Request, res: Response) {
    try {
        const {chargerId} = req.params;
        if (typeof chargerId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid charger id",
            });
        }
        const reservations = await getReservationsByChargerId(chargerId);

        return res.status(200).json({
            success: true,
            data: reservations,
        });
    } catch (error) {
        console.error("Error fetching all reservations for charger:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch all reservations for charger.",
        });
    }
}

/**
 * Get a reservation by its id
 * GET /api/reservations/:id
 */
export async function getReservationByIdController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid reservation id",
            });
        }
        const reservation = await getReservationById(id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        console.error("Error fetching reservation:", error)
        
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reservation",
        });
    }
}

/**
 * Update reservation fields
 * PUT /api/reservations/:id
 */
export async function updateReservationController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid reservation id",
            });
        }
        const updatedReservation = await updateReservation(id, req.body);

        return res.status(200).json({
            success: true,
            data: updatedReservation,
        });
    } catch (error) {
        console.error("Error updating reservation", error)

        return res.status(500).json({
             success: false,
             message: "Failed to update reservation",
        });
    }
}

/**
 * Delete a reservation by its id
 * DELETE /api/reservations/:id
 */
export async function deleteReservationController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid reservation id",
            });
        }
        await deleteReservation(id);

        return res.status(200).json({
            success: true,
            message: "Reservation deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting reservation:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to delete reservation",
        });
    }
}

/**
 * Cancel a reservation by its id
 * POST /api/reservations/:id/cancel
 */
export async function cancelReservationController(req: Request, res: Response) {
    try {
        const {id} = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid reservation id",
            });
        }
        const reservation = await cancelReservation(id);

        return res.status(200).json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        console.error("Error canceling reservation:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to cancel reservation",
        });
    }
}

/**
 * Create a reservation hold by its id
 * POST /api/reservations/hold
 */
export async function createReservationHoldController(req: Request, res: Response) {
    try {
        const reservation = await createReservationHold(req.body);

        return res.status(201).json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        console.error("Error creating reservation hold:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to create reservation hold",
        });
    }
}

/**
 * Confirm/create a reservation by its id
 * POST /api/reservations/confirm
 */
export async function confirmReservationController(req: Request, res: Response) {
    try {
        const reservation = await confirmReservation(req.body);

        return res.status(201).json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        console.error("Error confirming reservation hold:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to confirm reservation hold",
        });
    }
}