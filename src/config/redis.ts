import { createClient } from "redis";
import { env } from "./env";

/**
 * Redis client configuration
 */
const redis = createClient({
    url: env.REDIS_URL,
});

redis.on("error", (error) => {
    console.error("Redis error:", error);
});

// connect redis client
export async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect();
    }
}

export default redis;