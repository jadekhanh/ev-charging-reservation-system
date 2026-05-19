import { z } from "zod";
import {
    ChargerStatus,
    ConnectorType,
    PowerLevel,
} from "@prisma/client";

/**
 * Schema for creating charger
 * All fields are required except for status and match their expected data type
 */
export const createChargerSchema = z.object({
    stationId: z.uuid(),
    connectorType: z.enum(ConnectorType),
    powerLevel: z.enum(PowerLevel),
    status: z.enum(ChargerStatus).optional(),
});

/**
 * Schema for updating charger
 * All fields are optional and match their expected data type
 */
export const updateChargerSchema = createChargerSchema.partial();