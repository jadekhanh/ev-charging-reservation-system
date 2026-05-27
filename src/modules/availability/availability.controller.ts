/**
 * Availability controller handles HTTP requests/responses for availability routes
 */
import { Request, Response } from "express";
import {
    getAvailableChargers,
    getAvailableTimeSlots,
    getAvailableStations,
} from "./availability.service";

/**
 * Get all available chargers at a station that do not have overlapping reservations
 * GET /api/availability?stationId=...&startTime=...&endTime=...
 */
export async function getAvailableChargersController(req: Request, res: Response) {
    const chargers = await getAvailableChargers({
        stationId: req.query.stationId as string,
        startTime: new Date(req.query.startTime as string),
        endTime: new Date(req.query.endTime as string),
    });

    return res.status(200).json({
        success: true,
        data: chargers,
    });
}

/**
 * Get available time slots for a charger on a specific date
 * GET /api/availability/slots?chargerId=...&date=...
 */
export async function getAvailableTimeSlotsController(req: Request, res: Response) {
    const slots = await getAvailableTimeSlots({
        chargerId: req.query.chargerId as string,
        date: new Date(req.query.date as string),
    });

    return res.status(200).json({
        success: true,
        data: slots,
    });
}

/**
 * Get all stations that have at least 1 available charger for a requested time slot
 * GET /api/availability/stations?startTime=...&endTime=...
 */
export async function getAvailableStationsController(req: Request, res: Response) {
    const stations = await getAvailableStations({
        startTime: new Date(req.query.startTime as string),
        endTime: new Date(req.query.endTime as string),
    });

    return res.status(200).json({
        success: true,
        data: stations,
    });
}