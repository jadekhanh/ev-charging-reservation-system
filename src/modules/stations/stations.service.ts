/**
 * Stations service talks to database
 */
import prisma from "../../config/prisma";

/**
 * Expected data for createStation(data) and updateStation(data)
 */
type StationInput = {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
};

/**
 * Get all charging stations with their chargers by names in ascending order
 */
export async function getAllStations() {
    return prisma.station.findMany({
    include: {
        chargers: true,
    },
    orderBy: {
        name: "asc",
    },
    });
}

/**
 * Get a charging station by its ID
 */
export async function getStationById(id: string) {
    return prisma.station.findUnique({
        where: {id},
        include: {
            chargers: true,
        },
    });
}

/**
 * Create a new charging station
 */
export async function createStation(data: StationInput) {
    return prisma.station.create({
        data,
    });
}

/**
 * Update an existing charging station
 */
export async function updateStation(id: string, data: Partial<StationInput>) {
    return prisma.station.update({
        where: {id},
        data,
    });
}

/**
 * Delete a charging station by its id
 */
export async function deleteStation(id: string) {
    return prisma.station.delete({
        where: {id},
    });
}
