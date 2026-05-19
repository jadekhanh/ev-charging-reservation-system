/**
 * Starts backend server and connects Redis
 */
import app from "./app";
import { connectRedis } from "./config/redis";
import { env } from "./config/env";

// load PORT
const PORT = env.PORT;

/**
 * Server startup function
 */
async function startServer() {
    try {
        // connect Redis before server starts
        await connectRedis();

        // Express app starts listening to PORT
        app.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        // immediately exit with failure
        process.exit(1);
    }
}

startServer();