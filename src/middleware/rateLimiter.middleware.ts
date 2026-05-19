/**
 * Middleware users from spamming API
 */
import rateLimit from "express-rate-limit";

// rateLimit() returns a middleware
export const APIRateLimiter = rateLimit({
    // time window: how long to track requests: 15 minutes converted to ms
    windowMs: 15 * 60 * 1000,
    // limit number of requests within time window per IP
    limit: 100,
    // adds modern rate-limit infor headers so clients can see remaining requests and reset time
    standardHeaders: true,
    // disables deprecated rate limit headers
    legacyHeaders: false,
    // custom response when user exceeds limit, returned as JSON response
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    }
})