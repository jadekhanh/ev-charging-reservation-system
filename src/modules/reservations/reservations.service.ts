/**
 * Reservations service talks to database
 */
import {ReservationStatus} from "@prisma/client";
import prisma from "../../config/prisma";
import redis from "../../config/redis";
import { ApiError } from "../../utils/ApiError";

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
 * Check if there's an overlapping Redis reservation hold
 * @param chargerId 
 * @param startTime 
 * @param endTime 
 * @returns 
 */
async function hasOverlappingHold(chargerId: string, startTime: Date, endTime: Date) {
    const keys = await redis.keys(`hold:${chargerId}:*`);

    for (const key of keys) {
        const value = await redis.get(key);

        if (!value) continue;

        const hold = JSON.parse(value);

        const holdStart = new Date(hold.startTime);
        const holdEnd = new Date(hold.endTime);

        const overlaps =
            holdStart < endTime &&
            holdEnd > startTime;

        if (overlaps) {
            return true;
        }
    }

    return false;
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
    const holdKey = createHoldKey(
        data.chargerId,
        data.startTime,
        data.endTime
    );

    // check if we have a reservation hold first
    const existingHold = await redis.get(holdKey);
    if (!existingHold) {
        throw new ApiError(409, "Reservation hold expired or does not exist");
    }

    // check if there exists a reservation that overlaps this time slot at this charger
    const reservation = await prisma.$transaction(async (tx) => {
        const existingReservation = await tx.reservation.findFirst({
            where: {
                chargerId: data.chargerId,
                status: {
                    not: ReservationStatus.CANCELLED,
                },
                startTime: {
                    lt: data.endTime,
                },
                endTime: {
                    gt: data.startTime,
                },
            },
        });

        // if there's already a reservation
        if (existingReservation) {
            throw new ApiError(409, "This charger time slot is already reserved");
        }

        // if not, create a new one
        return tx.reservation.create({
            data: {
                ...data,
                status: ReservationStatus.CONFIRMED,
            },
            select: reservationSelect,
        });
    });

    // delete the Redis reservation hold
    await redis.del(holdKey);

    return reservation;
}

/**
 * Create a temporary reservation hold using Redis
 */
export async function createReservationHold(data: ReservationInput) {

    // short distributed lock for this charger
    const lockKey = `lock:${data.chargerId}`;

    const lock = await redis.set(lockKey, "locked", {
        EX: 5,
        NX: true,
    });

    // if another request already holds the lock, stop request
    if (!lock) {
        throw new ApiError(409, "This charger is currently being checked");
    }

    try {

        // check if there's a confirmed reservation conflict with this charger for this time slot
        const hasConflict = await hasReservationConflict(
            data.chargerId,
            data.startTime,
            data.endTime
        );

        if (hasConflict) {
            throw new ApiError(409, "This charger time slot is already reserved");
        }

        // check if there's an overlapping temporary Redis hold
        const hasHoldConflict = await hasOverlappingHold(
            data.chargerId,
            data.startTime,
            data.endTime
        );

        if (hasHoldConflict) {
            throw new ApiError(409, "This charger time slot is currently being held");
        }

        // unique Redis key for this hold
        const holdKey = createHoldKey(
            data.chargerId,
            data.startTime,
            data.endTime
        );

        // store temporary hold for 5 minutes
        await redis.set(
            holdKey,
            JSON.stringify(data),
            {
                EX: 300,
                NX: true,
            }
        );

        // return reservation hold info
        return {
            status: ReservationStatus.HOLD,
            holdKey,
            expiresInSeconds: 300,
            ...data,
        };

    } finally {

        // always release lock even if request fails
        await redis.del(lockKey);
    }
}