import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import {redis as redisClient} from "../config/redis.js";

export const authRateLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,

    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    }),

    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: "Too Many Requests",
            message: "Too many authentication attemps. Please try again in 2 minutes."
        })
    }
})

