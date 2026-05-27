import { z } from "zod";

/**
 * Schema for find all stations that have at least 1 available charger for a requested time slot
 * All fields are required and have to match their data type
 */
export const findAvailableStationsSchema = z
    .object({
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
    })
    .refine(
        (data) => data.endTime > data.startTime,
        {
            message: "End time must be after start time",
            path: ["endTime"],
        }
    );

/**
 * Schema for find all available chargers at a station that do not have overlapping reservations
 * All fields are required and have to match their data type
 */
export const findAvailableChargersSchema = z
    .object({
        stationId: z.uuid(),
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
    })
    .refine(
        (data) => data.endTime > data.startTime,
        {
            message: "End time must be after start time",
            path: ["endTime"],
        }
    );

/**
 * Schema for find all available time slots for a charger on a specific date
 * All fields are required and have to match their data type
 */
export const findAvailableTimeSlotsSchema = z
    .object({
        chargerId: z.uuid(),
        date: z.coerce.date(),
    });

