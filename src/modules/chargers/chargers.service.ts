/**
 * Chargers service talks to database
 */
import { ChargerStatus, ConnectorType, PowerLevel } from "@prisma/client";
import prisma from "../../config/prisma";

/**
 * Expected data for createCharger(data) and updateCharger(data)
 */
type ChargerInput = {
    stationId: string;
    connectorType: ConnectorType;
    powerLevel: PowerLevel;
    status: ChargerStatus;
}

/**
 * Get all chargers by station in ascending order
 */
export async function getAllChargers() {
    return prisma.charger.findMany({
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
 * Get all chargers belonging to a station
 */
export async function getChargersByStationId(stationId: string) {
    return prisma.charger.findMany({
        where: {stationId},
        select: {
            id: true,
            stationId: true,
            connectorType: true,
            powerLevel: true,
            status: true,
        },
    });
}

/**
 * Get a charger by its id
 */
export async function getChargerById(id: string) {
    return prisma.charger.findUnique({
        where: {id},
        select: {
            id: true,
            stationId: true,
            connectorType: true,
            powerLevel: true,
            status: true,
            station: {
                select: {
                    id: true,
                    name: true,
                    city: true,
                    state: true,
                    zipCode: true,
                }
            }
        },
    });
}

/**
 * Create a new charger
 */
export async function createCharger(data: ChargerInput) {
    return prisma.charger.create({
        data,
        select: {
            id: true,
            stationId: true,
            connectorType: true,
            powerLevel: true,
            status: true,
        },
    });
}

/**
 * Update an existing charger
 */
export async function updateCharger(id: string, data: Partial<ChargerInput>) {
    return prisma.charger.update({
        where: {id},
        data,
        select: {
            id: true,
            stationId: true,
            connectorType: true,
            powerLevel: true,
            status: true,
        },
    });
}

/**
 * Delete a charger by its id
 */
export async function deleteCharger(id: string) {
    return prisma.charger.delete({
        where: {id},
        select: {
            id: true,
            stationId: true,
            connectorType: true,
            powerLevel: true,
            status: true,
        },
    });
}