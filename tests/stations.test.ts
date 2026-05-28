import request from "supertest";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import app from "../src/app";
import { env } from "../src/config/env";
import prisma from "../src/config/prisma";
import redis from "../src/config/redis";

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
 * Test suite for stations API
 */
describe("Stations API", () => {
    // before each test, delete all reservations, chargers, stations, and users
    beforeEach(async () => {
        await prisma.reservation.deleteMany();
        await prisma.charger.deleteMany();
        await prisma.station.deleteMany();
        await prisma.user.deleteMany();
    });

    // after each test, disconnect prisma
    afterAll(async () => {
        await redis.quit();
        await prisma.$disconnect();
    });

    it("should reject if someone without token wants to get all stations", async () => {
        // create a response to get all stations
        const response = await request(app)
            .get("/api/stations");
        
        // expect response status code to be 401
        expect(response.status).toBe(401);
        // expect response success to be true
        expect(response.body.success).toBe(false);
    });

    it("should allow a customer to get all stations", async () => {
        // create a customer token
        const customerToken = createTestToken(
            "plushie-test-id",
            UserRole.CUSTOMER,
        );

        // create a response to get all stations with customer token
        const response = await request(app)
            .get("/api/stations")
            .set("Authorization", `Bearer ${customerToken}`);
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
    });

    it("should allow an admin to create a station", async () => {
        // create an admin token
        const adminToken = createTestToken(
            "plushie-test-id",
            UserRole.ADMIN,
        );

        // create a response to create a station with admin token
        const response = await request(app)
            .post("/api/stations")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(inputStation);
        
        // expect response status code to be 201
        expect(response.statusCode).toBe(201);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // expect name in response body data to be station name
        expect(response.body.data.name).toBe(inputStation.name);
    });

    it("should allow an admin to get all stations", async () => {
        // create an admin token
        const adminToken = createTestToken(
            "plushie-test-id",
            UserRole.ADMIN,
        );

        // create a station
        await prisma.station.create({
            data: inputStation,
        });

        // create a response to get all stations with admin token
        const response = await request(app)
            .get("/api/stations")
            .set("Authorization",  `Bearer ${adminToken}`);
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // expect response body data to have 1 station
        expect(response.body.data.length).toBe(1);
    });

    it("should allow an admin to get a station by its id", async () => {
        // create an admin token
        const adminToken = createTestToken(
            "plushie-test-id",
            UserRole.ADMIN,
        );

        // create a station
        const station = await prisma.station.create({
            data: inputStation,
        });

        // create a response to get the station just created with admin token
        const response = await request(app)
            .get(`/api/stations/${station.id}`)
            .set("Authorization", `Bearer ${adminToken}`);
        
        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // expect response body data id to be station id
        expect(response.body.data.id).toBe(station.id);
    });

    it("should allow an admin to update a station by its id", async () => {
        // create an admin token
        const adminToken = createTestToken(
            "plushie-test-id",
            UserRole.ADMIN,
        );

        // create a station
        const station = await prisma.station.create({
            data: inputStation,
        });

        // create a response to update the station's address with admin token
        const response = await request(app)
            .put(`/api/stations/${station.id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                address: "246 Plushies St"
            });

        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // expect response body includes station's new address
        const updatedStation = await prisma.station.findUnique({
            where: {
                id: station.id,
            },
        });
        expect(response.body.data.address).toBe("246 Plushies St");
        expect(updatedStation?.address).toBe("246 Plushies St");
    });

    it("should allow an admin to delete a station by its id", async () => {
        // create an admin token
        const adminToken = createTestToken(
            "plushie-test-id",
            UserRole.ADMIN,
        );

        // create a station
        const station = await prisma.station.create({
            data: inputStation,
        });

        // create a response to delete a station with admin token
        const response = await request(app)
            .delete(`/api/stations/${station.id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        // expect response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // expect the station to be deleted
        const deletedStation = await prisma.station.findUnique({
            where: {
                id: station.id,
            },
        });
        expect(deletedStation).toBeNull();
    });

    it("should reject when a customer wants to create a station", async () => {
        // create a customer token
        const customerToken = createTestToken(
            "plushie-test-id",
            UserRole.CUSTOMER,
        );

        // create a response to create a station with this customer token
        const response = await request(app)
            .post("/api/stations")
            .set("Authorization", `Bearer ${customerToken}`)
            .send(inputStation);
        
        // expect response status code to be 403
        expect(response.statusCode).toBe(403);
        // expect response success to be false
        expect(response.body.success).toBe(false);
    });

    it("should reject when an admin creates a station with invalid request body", async () => {
        // create an admin token
        const adminToken = createTestToken(
            "plushie-test-id",
            UserRole.ADMIN,
        );

        // create a response to create a station with invalid request body with admin token
        const response = await request(app)
            .post("/api/stations")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "",
            });
        
        // expect response status code to be 400
        expect(response.statusCode).toBe(400);
        // expect response success to be false
        expect(response.body.success).toBe(false);
    });

});