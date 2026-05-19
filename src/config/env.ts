import dotenv from "dotenv";

dotenv.config();

/**
 * A function to check for environments once at start up
 * @param name 
 * @returns 
 */
function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

export const env = {
    // use port specified in .env or fallbacks to 5000
    PORT: process.env.PORT || "5000",
    // the rest are required
    DATABASE_URL: requireEnv("DATABASE_URL"),
    JWT_SECRET: requireEnv("JWT_SECRET"),
    REDIS_URL: requireEnv("REDIS_URL"),
};