import request from "supertest";
import jwt from "jsonwebtoken";
import { UserRole, ChargerStatus, ConnectorType, PowerLevel, ReservationStatus } from "@prisma/client";
import app from "../src/app";
import { env } from "../src/config/env";
import prisma from "../src/config/prisma";
import { response } from "express";

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
}

/**
 * Input station data
 */
const inputStation = {
    name: "Plushies Station",
    address: "246 Plushies Road",
    city: "Boston",
    state: "MA",
    zipCode: "12345",
}

/**
 * Test suite for reservations API
 */
describe("Reservations API", () => {
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

    it("should successfully create a reservation hold", async () => {
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

        // create a response to create a reservation hold with customer token
        const response = await request(app)
            .post("/api/reservations/hold")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            });
        
        // expect response status code to be 201
        expect(response.statusCode).toBe(201);
        // expect response success to be true
        expect(response.body.success).toBe(true);
    });

    it("should successfully confirm a reservation", async () => {
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

        // create a reservation hold
        await request(app)
            .post("/api/reservations/hold")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            });

        // create a response to confirm a reservation
        const response = await request(app)
            .post("/api/reservations/confirm")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            });
        
        // expect response status code to be 201
        expect(response.statusCode).toBe(201);
        // expect response success to be true
        expect(response.body.success).toBe(true);
    });

    it("should allow a customer to get all of their reservations", async () => {
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

        // create a reservation
        const reservation = await prisma.reservation.create({
            data: {
                userId: customer.id,
                stationId: station.id,
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            }
        });

        // create a response to get all of their reservations
        const response = await request(app)
            .get("/api/reservations/me")
            .set("Authorization", `Bearer ${customerToken}`)
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // expect the request body data length to be 1
        expect(response.body.data.length).toBe(1);
    });

    it("should allow a customer to get their reservation by its id", async () => {
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

        // create a reservation
        const reservation = await prisma.reservation.create({
            data: {
                userId: customer.id,
                stationId: station.id,
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            }
        });

        // create a response to get reservation by its id
        const response = await request(app)
            .get(`/api/reservations/${reservation.id}`)
            .set("Authorization", `Bearer ${customerToken}`);
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        
    })

    it("should reject when a customer wants to get another customer's reservation by its id", async () => {
        // create a customer
        const customer = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.CUSTOMER,
            }
        });

        // create another customer
        const anotherCustomer = await prisma.user.create({
            data: {
                email: "macaroni@plushies.com",
                password: "macaronihash7",
                role: UserRole.CUSTOMER,
            }
        });

        // create a another customer token
        const anotherCustomerToken = createTestToken(
            anotherCustomer.id,
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

        // create a reservation
        const reservation = await prisma.reservation.create({
            data: {
                userId: customer.id,
                stationId: station.id,
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            }
        });

        // create a response to get reservation belonging to another customer by its id
        const response = await request(app)
            .get(`/api/reservations/${reservation.id}`)
            .set("Authorization", `Bearer ${anotherCustomerToken}`);
        
        // expect response status code to be 403
        expect(response.statusCode).toBe(403);
        // expect response success to be false
        expect(response.body.success).toBe(false);
    });

    it("should allow a customer to cancel their reservation", async () => {
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

        // create a reservation
        const reservation = await prisma.reservation.create({
            data: {
                userId: customer.id,
                stationId: station.id,
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            }
        });

        // create a response to cancel reservation by its id with customer token
        const response = await request(app)
            .post(`/api/reservations/${reservation.id}/cancel`)
            .set("Authorization", `Bearer ${customerToken}`);
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // confirm cancelled reservation is canceled
        const canceledReservation = await prisma.reservation.findUnique({
            where: {
                id: reservation.id,
            },
        });
        expect(canceledReservation?.status).toBe(ReservationStatus.CANCELLED);

    });

    it("should reject when a customer wants to delete a reservation by its id", async () => {
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

        // create a reservation
        const reservation = await prisma.reservation.create({
            data: {
                userId: customer.id,
                stationId: station.id,
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            }
        });

        // create a response to delete reservation by its id with customer token
        const response = await request(app)
            .delete(`/api/reservations/${reservation.id}`)
            .set("Authorization", `Bearer ${customerToken}`);
        
        // expect response status code to be 403
        expect(response.statusCode).toBe(403);
        // expect response success to be false
        expect(response.body.success).toBe(false);
    });

    it("should allow an admin to delete a reservation by its id", async () => {
        // create an admin
        const admin = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.ADMIN,
            }
        });

        // create an admin token
        const adminToken = createTestToken(
            admin.id,
            UserRole.ADMIN,
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

        // create a reservation
        const reservation = await prisma.reservation.create({
            data: {
                userId: admin.id,
                stationId: station.id,
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            }
        });

        // create a response to cancel reservation by its id with admin token
        const response = await request(app)
            .delete(`/api/reservations/${reservation.id}`)
            .set("Authorization", `Bearer ${adminToken}`);
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // confirm reservation is deleted
        const deletedReservation = await prisma.reservation.findUnique({
            where: {
                id: reservation.id,
            },
        });
        expect(deletedReservation).toBeNull();
    });

    it("should reject overlapping reservation hold", async () => {
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

        // request to create a reservation hold
        const reservationHold = await request(app)
            .post("/api/reservations/hold")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            });
        
        // expect reservation hold to have status code 201
        expect(reservationHold.statusCode).toBe(201);
        // expect reservation hold success to be true
        expect(reservationHold.body.success).toBe(true);

        // create a response to request to create the same reservation
        const response = await request(app)
            .post("/api/reservations/hold")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            });
        
        // expect response status code to be 409
        expect(response.statusCode).toBe(409);
        // expect response success to be false
        expect(response.body.success).toBe(false);
    });

    it("should reject customer canceling another customer's reservation", async () => {
        // create a customer
        const customer = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.CUSTOMER,
            }
        });

        // create another customer
        const anotherCustomer = await prisma.user.create({
            data: {
                email: "macaroni@plushies.com",
                password: "macaronihash7",
                role: UserRole.CUSTOMER,
            }
        });

        // create another customer token
        const anotherCustomerToken = createTestToken(
            anotherCustomer.id,
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

        // create a reservation
        const reservation = await prisma.reservation.create({
            data: {
                userId: customer.id,
                stationId: station.id,
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            }
        });

        // create a response to cancel a reservation belonging to another customer by its id
        const response = await request(app)
            .post(`/api/reservations/${reservation.id}/cancel`)
            .set("Authorization", `Bearer ${anotherCustomerToken}`);
        
        // expect response status code to be 403
        expect(response.statusCode).toBe(403);
        // expect response success to be false
        expect(response.body.success).toBe(false);
    });

    it("should reject reservation hold without token", async () => {
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

        // create a response to request to create the same reservation
        const response = await request(app)
            .post("/api/reservations/hold")
            .send({
                chargerId: charger.id,
                startTime: new Date("2026-05-20T8:00:00"),
                endTime: new Date("2026-05-20T9:00:00"),
            });
        
        // expect response status code to be 401
        expect(response.statusCode).toBe(401);
        // expect response success to be false
        expect(response.body.success).toBe(false);
    });

    it("should allow only 1 concurrent reservation hold for the same charger and timing", async () => {
        // create 1st customer
        const customerOne = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.CUSTOMER,
            }
        });

        // create 1st customer token
        const customerOneToken = createTestToken(
            customerOne.id,
            UserRole.CUSTOMER,
        );

        // create 2nd customer
        const customerTwo = await prisma.user.create({
            data: {
                email: "macaroni@plushies.com",
                password: "macaronihash7",
                role: UserRole.CUSTOMER,
            }
        });

        // create 2nd customer token
        const customerTwoToken = createTestToken(
            customerTwo.id,
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

        // make 2 requests to make reservation hold for same charger at same time by 2 customers
        // user Promise to run 2 async operations at the same time
        const responses = await Promise.all([
            request(app)
                .post("/api/reservations/hold")
                .set("Authorization", `Bearer ${customerOneToken}`)
                .send({
                    chargerId: charger.id,
                    startTime: new Date("2026-05-20T8:00:00"),
                    endTime: new Date("2026-05-20T9:00:00"),
                }),

            request(app)
                .post("/api/reservations/hold")
                .set("Authorization", `Bearer ${customerTwoToken}`)
                .send({
                    chargerId: charger.id,
                    startTime: new Date("2026-05-20T8:00:00"),
                    endTime: new Date("2026-05-20T9:00:00"),
                }),

        ]);

        // retrieve status codes of 2 requests
        const statusCodes = responses.map((response) => response.statusCode);

        // expect 1 response to have status code of 201 and the other to be 409
        expect(statusCodes.filter((code) => code === 201).length).toBe(1);
        expect(statusCodes.filter((code) => code === 409).length).toBe(1);
    });

    it("should allow only 1 concurrent reservation hold for the same charger but overlapping timing", async () => {
        // create 1st customer
        const customerOne = await prisma.user.create({
            data: {
                email: "jellycat@plushies.com",
                password: "jellycathash6",
                role: UserRole.CUSTOMER,
            }
        });

        // create 1st customer token
        const customerOneToken = createTestToken(
            customerOne.id,
            UserRole.CUSTOMER,
        );

        // create 2nd customer
        const customerTwo = await prisma.user.create({
            data: {
                email: "macaroni@plushies.com",
                password: "macaronihash7",
                role: UserRole.CUSTOMER,
            }
        });

        // create 2nd customer token
        const customerTwoToken = createTestToken(
            customerTwo.id,
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

        // make 2 requests to make reservation hold for same charger but overlapping time by 2 customers
        // user Promise to run 2 async operations at the same time
        const responses = await Promise.all([
            request(app)
                .post("/api/reservations/hold")
                .set("Authorization", `Bearer ${customerOneToken}`)
                .send({
                    chargerId: charger.id,
                    startTime: new Date("2026-05-20T8:00:00"),
                    endTime: new Date("2026-05-20T9:00:00"),
                }),

            request(app)
                .post("/api/reservations/hold")
                .set("Authorization", `Bearer ${customerTwoToken}`)
                .send({
                    chargerId: charger.id,
                    startTime: new Date("2026-05-20T8:30:00"),
                    endTime: new Date("2026-05-20T9:30:00"),
                }),

        ]);

        // retrieve status codes of 2 requests
        const statusCodes = responses.map((response) => response.statusCode);

        // expect 1 response to have status code of 201 and the other to be 409
        expect(statusCodes.filter((code) => code === 201).length).toBe(1);
        expect(statusCodes.filter((code) => code === 409).length).toBe(1);
    });
})

