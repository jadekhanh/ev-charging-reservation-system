import request from "supertest";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import app from "../src/app";
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
 * Test suite for stations API
 */
describe("Stations API", () => {
    it("should get all stations", async () => {
        const response = await request(app).get("/api/stations");
        expect(response.status).toBe(401);
    });

    it("should reject unauthenticated resquests", async () => {
        const adminToken = createTestToken(
            "admin-test-id",
            UserRole.ADMIN
    });

});