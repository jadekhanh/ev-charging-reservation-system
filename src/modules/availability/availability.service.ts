/**
 * Availability service talks to database
 */
import { ChargerStatus, ReservationStatus, Reservation } from "@prisma/client";
import prisma from "../../config/prisma";

/**
 * Available chargers input
 */
type AvailableChargersInput = {
    stationId: string;
    startTime: Date;
    endTime: Date;
};

/**
 * Available stations input
 */
type AvailableStationsInput = {
    startTime: Date;
    endTime: Date;
};

/**
 * Available time slots input
 */
type AvailableTimeSlotsInput = {
    chargerId: string;
    date: Date;
};

/**
 * Get all available chargers at a station that do not have overlapping reservations
 */
export async function getAvailableChargers(data: AvailableChargersInput) {
    return prisma.charger.findMany({
        // find chargers
        where: {
            // belonging to the requested station
            stationId: data.stationId,
            // charger status is available
            status: ChargerStatus.AVAILABLE,
            // exclude ones that have active reservations and have overlapping time slots
            reservations: {
                none: {
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
            },
        },
        select: {
            id: true,
            stationId: true,
            connectorType: true,
            powerLevel: true,
            status: true,
        },
        orderBy: {
            stationId: "asc",
        },
    });
}

/**
 * Get all stations that have at least 1 available charger for a requested time slot
 */
export async function getAvailableStations(data: AvailableStationsInput) {
    return prisma.station.findMany({
        // find stations where
        where: {
            // there exists at least 1 charger -> use some: {}
            chargers: {
                some: {
                    // that charger is available
                    status: ChargerStatus.AVAILABLE,
                    reservations: {
                        // excludes reservations that are active and overlapping with requested time
                        none: {
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
                    },
                },
            },
        },
        include: {
            chargers: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

/**
 * Get available time slots for a charger on a specific date
 */
export async function getAvailableTimeSlots(data: AvailableTimeSlotsInput) {
    const startOfDay = new Date(data.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(data.date);
    endOfDay.setHours(23, 59, 59, 999);

    // find all active reservations belonging to a charger that is within start and end of specific date
    const reservations = await prisma.reservation.findMany({
        where: {
            chargerId: data.chargerId,
            status: {
                not: ReservationStatus.CANCELLED,
            },
            startTime: {
                lt: endOfDay,
            },
            endTime: {
                gt: startOfDay,
            },
        },
        orderBy: {
            startTime: "asc",
        },
    });

    // all resulting 60-minute time slots
    const slots: {
        startTime: Date;
        endTime: Date;
    }[] = [];
    const slotMinutes = 60;

    for (
        // initialize current time = Date 00:00
        let current = new Date(startOfDay);
        // move pointer while current time < Date 23:59
        current < endOfDay;
        // move forward by one slot
        current = new Date(current.getTime() + slotMinutes * 60 * 1000)
    ) {
        // begin and end of current slot
        const slotStart = new Date(current);
        const slotEnd = new Date(current.getTime() + slotMinutes * 60 * 1000);
        // check if there's any reservation that overlaps with this slot
        const hasOverlap = reservations.some((reservation: Reservation) => {
            return reservation.startTime < slotEnd && reservation.endTime > slotStart;
        });
        // if there's no reservation that overlaps with this slot, add this time slot into result
        if (!hasOverlap) {
            slots.push({
                startTime: slotStart,
                endTime: slotEnd,
            });
        }
    }

    return slots;

}