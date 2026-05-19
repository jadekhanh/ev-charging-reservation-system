import { z } from "zod";

/**
 * Schema for creating reservation
 * All fields are required and have to match their data type
 */
export const createReservationHoldSchema = z.object({
    userId: z.uuid(),
    stationId: z.uuid(),
    chargerId: z.uuid(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
});

/**
 * Schema for confirm reservation
 * All fields are required and have to match their data type
 */
export const confirmReservationSchema = createReservationHoldSchema;

/**
 * Schema for updating reservation
 * All fields are optional and have to match their data type
 */
export const updateReservationSchema = createReservationHoldSchema.partial();