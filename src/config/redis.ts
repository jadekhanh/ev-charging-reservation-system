import { createClient } from "redis";

/**
 * Set up Redis
 */
const redis = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (error) => {
    console.error("Redis error", error);
});

export async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect();
    }
}

export default redis;