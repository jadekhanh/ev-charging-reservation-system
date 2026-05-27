import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import { ChargerStatus, ConnectorType, PowerLevel, UserRole, ReservationStatus } from "@prisma/client";
import prisma from "../src/config/prisma";
import { env } from "../src/config/env";

/**
 * Creates fake JWT token for testing protected routes
 */
function createTestToken(userId: string, role: UserRole) {
    return jwt.sign(
        { userId, role },
        env.JWT_SECRET,
        { expiresIn: "1d" }
    );
}

/**
 * Input charger data
 */
const inputCharger = {
    connectorType: ConnectorType.NACS,
    powerLevel: PowerLevel.DC_FAST,
    status: ChargerStatus.AVAILABLE,
};

/**
 * Input station data
 */
const inputStation = {
    name: "Plushies Station",
    address: "246 Plushies Road",
    city: "Boston",
    state: "MA",
    zipCode: "12345",
};

/**
 * Test suite for Availability API
 */
describe ("Availability API", () => {
    // before each test, delete all reservations, chargers, stations, and users
    beforeEach(async () => {
        await prisma.reservation.deleteMany();
        await prisma.charger.deleteMany();
        await prisma.station.deleteMany();
        await prisma.user.deleteMany();
    });

    // after each test, disconnect prisma
    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should return available chargers at a station", async () => {
        // create a customer
        const customer = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.CUSTOMER,
            }
        });

        // create a customer token
        const customerToken = createTestToken(
            customer.id,
            UserRole.CUSTOMER,
        );

        // create a station
        const station = await prisma.station.create({
            data: inputStation,
        });

        // create a charger
        const charger = await prisma.charger.create({
            data: {
                ...inputCharger,
                stationId: station.id,
            }
        });

        // create a response to request all available chargers
        const response = await request(app)
            .get("/api/availability/chargers")
            .set("Authorization", `Bearer ${customerToken}`)
            .query({
                stationId: station.id,
                startTime: new Date("2026-05-20T14:00:00.000Z"),
                endTime: new Date("2026-05-20T15:00:00.000Z"),
            });
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // expect response body data length to be 1 since we only have 1 charger
        expect(response.body.data.length).toBe(1);
        // expect response body data id to be charger id
        expect(response.body.data[0].id).toBe(charger.id);

    });

    it("should exclude chargers with overlapping reservations", async () => {
        // create a customer
        const customer = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.CUSTOMER,
            }
        });

        // create a customer token
        const customerToken = createTestToken(
            customer.id,
            UserRole.CUSTOMER,
        );

        // create a station
        const station = await prisma.station.create({
            data: inputStation,
        });

        // create a charger
        const charger = await prisma.charger.create({
            data: {
                ...inputCharger,
                stationId: station.id,
            }
        });

        // create a reservation with a specific time
        await prisma.reservation.create({
            data: {
                stationId: station.id,
                chargerId: charger.id,
                userId: customer.id,
                startTime: new Date("2026-05-20T14:00:00.000Z"),
                endTime: new Date("2026-05-20T15:00:00.000Z"),
                status: ReservationStatus.CONFIRMED,
            },
        });

        // create a response to find all chargers at the same station within overlapping time slot with the reservation above
        const response = await request(app)
            .get("/api/availability/chargers")
            .set("Authorization", `Bearer ${customerToken}`)
            .query({
                stationId: station.id,
                startTime: new Date("2026-05-20T14:30:00.000Z"),
                endTime: new Date("2026-05-20T15:30:00.000Z"),
            });
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response body success to be true
        expect(response.body.success).toBe(true);
        // expect response body data length to be 0 since there should be no available chargers that is not overlapping with requested time slot
        expect(response.body.data.length).toBe(0);

    });

    it("should include 1 charger with non-overlapping reservations", async () => {
        // create a customer
        const customer = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.CUSTOMER,
            }
        });

        // create a customer token
        const customerToken = createTestToken(
            customer.id,
            UserRole.CUSTOMER,
        );

        // create a station
        const station = await prisma.station.create({
            data: inputStation,
        });

        // create a charger
        const charger = await prisma.charger.create({
            data: {
                ...inputCharger,
                stationId: station.id,
            }
        });

        // create a reservation with a specific time
        await prisma.reservation.create({
            data: {
                stationId: station.id,
                chargerId: charger.id,
                userId: customer.id,
                startTime: new Date("2026-05-20T14:00:00.000Z"),
                endTime: new Date("2026-05-20T15:00:00.000Z"),
                status: ReservationStatus.CONFIRMED,
            },
        });

        // create a response to find all chargers at the same station within non-overlapping time slot with the reservation above
        const response = await request(app)
            .get("/api/availability/chargers")
            .set("Authorization", `Bearer ${customerToken}`)
            .query({
                stationId: station.id,
                startTime: new Date("2026-05-20T17:00:00.000Z"),
                endTime: new Date("2026-05-20T18:00:00.000Z"),
            });
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response body success to be true
        expect(response.body.success).toBe(true);
        // expect response body data length to be 1
        expect(response.body.data.length).toBe(1);
        // expect response body to include charger id
        expect(response.body.data[0].id).toBe(charger.id);

    });

    it("should return all stations with at least 1 available charger for a requested time slot", async () => {
        // create a customer
        const customer = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.CUSTOMER,
            }
        });

        // create a customer token
        const customerToken = createTestToken(
            customer.id,
            UserRole.CUSTOMER,
        );

        // create a station
        const station = await prisma.station.create({
            data: inputStation,
        });

        // create a charger
        await prisma.charger.create({
            data: {
                ...inputCharger,
                stationId: station.id,
            }
        });

        // create a response to request all stations
        const response = await request(app)
            .get("/api/availability/stations")
            .set("Authorization", `Bearer ${customerToken}`)
            .query({
                startTime: new Date("2026-05-20T14:30:00.000Z"),
                endTime: new Date("2026-05-20T15:30:00.000Z"),
            });
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // expect response body data length to be 1 since we only have 1 charger
        expect(response.body.data.length).toBe(1);
        // expect response body data id to be station id
        expect(response.body.data[0].id).toBe(station.id);

    });

    it("should return all available time slots for a charger on a specific date", async () => {
        // create a customer
        const customer = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.CUSTOMER,
            }
        });

        // create a customer token
        const customerToken = createTestToken(
            customer.id,
            UserRole.CUSTOMER,
        );

        // create a station
        const station = await prisma.station.create({
            data: inputStation,
        });

        // create a charger
        const charger = await prisma.charger.create({
            data: {
                ...inputCharger,
                stationId: station.id,
            }
        });

        // create a response to request all time slots
        const response = await request(app)
            .get("/api/availability/slots")
            .set("Authorization", `Bearer ${customerToken}`)
            .query({
                chargerId: charger.id,
                date: new Date("2026-05-20"),
            });
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // expect response body data length to be greater than 0 since we expect multiple time slots
        expect(response.body.data.length).toBeGreaterThan(0);

    });

    it("should exclude unavailable time slots with overlapping reservations", async () => {
        // create a customer
        const customer = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.CUSTOMER,
            }
        });

        // create a customer token
        const customerToken = createTestToken(
            customer.id,
            UserRole.CUSTOMER,
        );

        // create a station
        const station = await prisma.station.create({
            data: inputStation,
        });

        // create a charger
        const charger = await prisma.charger.create({
            data: {
                ...inputCharger,
                stationId: station.id,
            }
        });

        // create a reservation with a specific time
        await prisma.reservation.create({
            data: {
                stationId: station.id,
                chargerId: charger.id,
                userId: customer.id,
                startTime: new Date("2026-05-20T14:00:00.000Z"),
                endTime: new Date("2026-05-20T15:00:00.000Z"),
                status: ReservationStatus.CONFIRMED,
            },
        });

        // create a response to request all time slots on the same day
        const response = await request(app)
            .get("/api/availability/slots")
            .set("Authorization", `Bearer ${customerToken}`)
            .query({
                chargerId: charger.id,
                date: new Date("2026-05-20"),
            });
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // expect API to not return any time slot that overlaps with a blocked reservation
        // a slot looks like { startTime in string, endTime in string }
        const hasBlockedSlot = response.body.data.some((slot: {
            startTime: string;
            endTime: string;
        }) => {
            return (
                new Date(slot.startTime) < new Date("2026-05-20T15:00:00.000Z") &&
                new Date(slot.endTime) > new Date("2026-05-20T14:00:00.000Z")
            );
        });
        expect(hasBlockedSlot).toBe(false);

    });

    it("should reject missing/invalid query params", async () => {
        // create a customer
        const customer = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.CUSTOMER,
            }
        });

        // create a customer token
        const customerToken = createTestToken(
            customer.id,
            UserRole.CUSTOMER,
        );

        // create a response to request all time slots
        const response = await request(app)
            .get("/api/availability/slots")
            .set("Authorization", `Bearer ${customerToken}`)
            .query({
                date: new Date("2026-05-20"),
            });
        
        // expect response status code to be 400
        expect(response.statusCode).toBe(400);
        // expect response success to be false
        expect(response.body.success).toBe(false);
    });

    it("should reject request without token", async () => {
        // create a response to request all available stations within a specific date without a token
        const response = await request(app)
            .get("/api/availability/stations")
            .query({
                startTime: new Date("2026-05-20T14:30:00.000Z"),
                endTime: new Date("2026-05-20T15:30:00.000Z"),
            });

        // expect response status code to be 401
        expect(response.statusCode).toBe(401);
        // expect response success to be false
        expect(response.body.success).toBe(false);

    });
})