/**
 * Assemble backend pieces together by connecting middleware and routes
 * Build Express app
 */
import express from "express";
import cors from "cors"; // CORS allows front and backend on different ports to communicate
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import stationRoutes from "./modules/stations/stations.routes";
import chargerRoutes from "./modules/chargers/chargers.routes";
import reservationRoutes from "./modules/reservations/reservations.routes";
import availabilityRoutes from "./modules/availability/availability.routes";
import { APIRateLimiter } from "./middleware/rateLimiter.middleware";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { swaggerDocs, swaggerSetup } from "./config/swagger";

// creates Express app
const app = express();
// app uses CORS to communicate to ports
app.use(cors());
// app uses JSON request bodies
app.use(express.json());
// app applies rate limiter globally so every request passes through it
app.use(APIRateLimiter);
// app runs Swagger docs
app.use("/api-docs", swaggerDocs, swaggerSetup);

// connect all routes
app.use("/api/auth", authRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/chargers", chargerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/availability", availabilityRoutes);

// adds global middlewares: if no route is matched, notFoundHandler runs and errorHandler catches thrown errors
app.use(notFoundHandler);
app.use(errorHandler);

// export app so server.ts can use it
export default app;