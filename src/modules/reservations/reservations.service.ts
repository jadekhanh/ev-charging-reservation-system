/**
 * Reservations service talks to database
 */
import {ReservationStatus} from "@prisma/client";
import prisma from "../../config/prisma";
import redis from "../../config/redis";

/**
 * Expected data for createReservationHold(data), confirmReservation(data) and updateReservation(data)
 */
type ReservationInput = {
    userId: string;
    stationId: string;
    chargerId: string;
    startTime: Date;
    endTime: Date;
};

/**
 * Expected output
 */
const reservationSelect = {
    id: true,
    userId: true,
    stationId: true,
    chargerId: true,
    startTime: true,
    endTime: true,
    status: true,
};

/**
 * Create a unique Redis key for a charger time-slot hold
 */
function createHoldKey(chargerId: string, startTime: Date, endTime: Date) {
    // hold a reservation for a charger within a time slot
    return `hold:${chargerId}:${startTime.toISOString()}:${endTime.toISOString()}`;
}

/**
 * Check if a confirmed reservation already exists for the a charger and time range
 */
async function hasReservationConflict(chargerId: string, startTime: Date, endTime: Date) {
    const existingReservation = await prisma.reservation.findFirst({
        where: {
            // check if they have same charger and this reservation is already confirmed
            chargerId,
            status: ReservationStatus.CONFIRMED,
            // check overlapping time slot: if existing startTime < new endTime and existing endTime > new startTime
            startTime: {
                lt: endTime,
            },
            endTime: {
                gt: startTime,
            },
        }
    });

    // return true if such reservation exists
    return Boolean(existingReservation);
}

/**
 * Get all reservations by station in ascending order
 */
export async function getAllReservations() {
    return prisma.reservation.findMany({
        select: reservationSelect,
        orderBy: {
            id: "asc",
        },
    });
}

/**
 * Get all reservations belonging to a station in ascending order
 */
export async function getReservationsByStationId(stationId: string) {
    return prisma.reservation.findMany({
        where: {stationId},
        select: reservationSelect,
        orderBy: {
            id: "asc",
        },
    });
}

/**
 * Get all reservations belonging to a user in ascending order
 */
export async function getReservationsByUserId(userId: string) {
    return prisma.reservation.findMany({
        where: {userId},
        select: reservationSelect,
        orderBy: {
            id: "asc",
        },
    });
}

/**
 * Get all reservations belonging to a charger in ascending order
 */
export async function getReservationsByChargerId(chargerId: string) {
    return prisma.reservation.findMany({
        where: {chargerId},
        select: reservationSelect,
        orderBy: {
            id: "asc",
        },
    });
}

/**
 * Get a reservation by its id
 */
export async function getReservationById(id: string) {
    return prisma.reservation.findUnique({
        where: {id},
        select: reservationSelect,
    });
}

/**
 * Update an existing reservation
 */
export async function updateReservation(id: string, data: Partial<ReservationInput>) {
    return prisma.reservation.update({
        where: {id},
        data,
        select: reservationSelect,
    });
}

/**
 * Delete a reservation by its id
 */
export async function deleteReservation(id: string) {
    return prisma.reservation.delete({
        where: {id},
        select: reservationSelect,
    });
}

/**
 * Cancel a reservation by its id
 */
export async function cancelReservation(id: string) {
    return prisma.reservation.update({
        where: {id},
        // update reservation status to CANCELLED
        data : {
            status: ReservationStatus.CANCELLED,
        },
        select: reservationSelect,
    });
}

/**
 * Confirm a new reservation from existing Redis reservation hold
 */
export async function confirmReservation(data: ReservationInput) {
    // check if there's a confirmed reservation conflict with this charger for this time slot
    const hasConflict = await hasReservationConflict(data.chargerId, data.startTime, data.endTime);
    if (hasConflict) {
        // stop the request
        throw new Error("This charger time slot is already reserved");
    }

    // check if there's an existing hold for this charger in this time slot
    const holdKey = createHoldKey(data.chargerId, data.startTime, data.endTime);
    const existingHold = await redis.get(holdKey);
    if (!existingHold) {
        // stop the request
        throw new Error("Reservation hold expires or does not exist");
    }

    // create this reservation
    const reservation = await prisma.reservation.create({
        data: {
            ...data,
            // update reservation status to CONFIRMED
            status: ReservationStatus.CONFIRMED,
        },
        select: reservationSelect,
    });

    // delete the reservation hold from Redis
    await redis.del(holdKey);

    // return reservation
    return reservation;

}

/**
 * Create a temporary reservation hold using Redis
 */
export async function createReservationHold(data: ReservationInput) {
    // check if there's a confirmed reservation conflict with this charger for this time slot
    const hasConflict = await hasReservationConflict(data.chargerId, data.startTime, data.endTime);
    if (hasConflict) {
        // stop the request
        throw new Error("This charger time slot is already reserved");
    }

    // check if there's an existing hold for this charger in this time slot
    const holdKey = createHoldKey(data.chargerId, data.startTime, data.endTime);
    const existingHold = await redis.get(holdKey);
    if (existingHold) {
        // stop the request
        throw new Error("This charger time slot is being held");
    }

    // if this slot is not held yet, hold this slot for 5 minutes
    await redis.set(
        holdKey,
        JSON.stringify(data), {
            // expires in 5 minutes
            EX: 300,
            NX: true
        }
    );

    // return information of reservation hold
    return {
        status: ReservationStatus.HOLD,
        holdKey,
        expiresInSeconds: 300,
        ...data,
    };
}