import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {

    lazyConnect: true,

    maxRetriesPerRequest: 3,
    enableReadyCheck: true

    // retryStrategy
});

export async function connectRedis() {
  if (redis.status === 'wait') {
    return await redis.connect();
  }
};

redis.on("connect", () => {
  console.info("[Redis] TCP connection established.");
});

redis.on("ready", () => {
  console.info("[Redis] Client ready and verified.");
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err);
});

