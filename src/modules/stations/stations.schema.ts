import { z } from "zod";

/**
 * Schema for creating station
 * All fields are required and have to be non-empty string type
 */
export const createStationSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
});

/**
 * Schema for updating station
 * All fields are optional and have to be non-empty string type
 */
export const updateStationSchema = createStationSchema.partial();