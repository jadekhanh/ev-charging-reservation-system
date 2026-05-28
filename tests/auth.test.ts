import request from "supertest";
import app from "../src/app";
import prisma from "../src/config/prisma";
import redis from "../src/config/redis";

/**
 * Test suite for Authorization API
 */
describe ("Auth API", () => {
    // before each test, delete everything
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

    it("should register a new user", async ()  => {
        // create a response from requesting app to register a new user
        const email = `user-${crypto.randomUUID()}@test.com`;
        const password = "jellycathash6";
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email,
                password,
            });

        // expect response status code to be 201
        expect(response.status).toBe(201);
        // expect response success to be true
        expect(response.body.success).toBe(true);
        // expect the response body data to have the expected email
        expect(response.body.data.email).toBe(email);
        // expect response body to not include password hash
        expect(response.body.data.passwordHash).toBeUndefined();

    });

    it("should not register duplicate email", async () => {
        // request app to register a new user
        const email = `user-${crypto.randomUUID()}@test.com`;
        const password = "jellycathash6";
        await request(app)
            .post("/api/auth/register")
            .send({
                email,
                password,
            });
        
        
        // create a response to request the app to register the same user
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email,
                password,
            });
        
        // expect the response status code to be 409
        expect(response.statusCode).toBe(409);
        // expect the response success to be false
        expect(response.body.success).toBe(false);
    });

    it("should login a registered user", async () => {
        // request app to register a new user
        const email = `user-${crypto.randomUUID()}@test.com`;
        const password = "jellycathash6";
        await request(app)
            .post("/api/auth/register")
            .send({
                email,
                password,
            });
        
        // create a response to request the app to login into the same user
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password,
            });
        
        // expect the response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect the response body success to be true
        expect(response.body.success).toBe(true);
        // expect the login token to exist
        expect(response.body.data.token).toBeDefined();
        // expect the response body data to have the expected email
        expect(response.body.data.user.email).toBe(email);
        // expect response body to not include password hash
        expect(response.body.data.user.passwordHash).toBeUndefined();

    });

    it("should reject login with a wrong password", async () => {
        // request app to register a new user
        const email = `user-${crypto.randomUUID()}@test.com`;
        const password = "jellycathash6";
        await request(app)
            .post("/api/auth/register")
            .send({
                email,
                password,
            });
        
        // create a response to request the app to login into the same user with wrong password
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password: "wrongpassword",
            });
        
        // expect the response status to be 401
        expect(response.statusCode).toBe(401);
        // expect the response body success to be false
        expect(response.body.success).toBe(false);
    });

    it("should get current user with valid token", async () => {
        // request app to register a new user
        const email = `user-${crypto.randomUUID()}@test.com`;
        const password = "jellycathash6";
        await request(app)
            .post("/api/auth/register")
            .send({
                email,
                password,
            });
        
        // create a login response to request the app to log into the same user
        const logInResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password,
            });
        
        // retrieve the login token
        const token = logInResponse.body.data.token;

        // create a response to request the app to get the authenticated user using the token
        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);
        
        // expect the response status code to be 200
        expect(response.statusCode).toBe(200);
        // expect the response body success to be true
        expect(response.body.success).toBe(true);
        // expect the response body data to have the expected email
        expect(response.body.data.email).toBe(email);
        // expect response body to not include password hash
        expect(response.body.data.passwordHash).toBeUndefined();

    });

    it("should reject current user request without token", async () => {
        // create a response to request the app to get user without token
        const response = await request(app)
            .get("/api/auth/me")
        
        // expect the response status code to be 401
        expect(response.statusCode).toBe(401);
        // expect the response body success to be false
        expect(response.body.success).toBe(false);

    });

    it("should reject login with unregistered email", async () => {
        // create a login response to request login with unregistered email
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "macaroni@plushies.com",
                password: "macaronihash7",
            });
        
        // expect response status code to be 401
        expect(response.statusCode).toBe(401);
        // expect response success to be false
        expect(response.body.success).toBe(false);
    });

    it("should reject registration with invalid request body", async () => {
        // request app to register a new user with invalid request body
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "macaroni@plushies.com",
            });

        // expect response status code to be 400
        expect(response.statusCode).toBe(400);
        // expect response success to be false
        expect(response.body.success).toBe(false);
    });
});