import { Redis } from "@upstash/redis"

// Create a Redis client using environment variables
let redis: Redis

try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  })

  // Test the connection
  redis.ping().catch((err) => {
    console.error("Redis connection test failed:", err)
  })
} catch (error) {
  console.error("Failed to initialize Redis client:", error)
  // Create a fallback implementation that doesn't throw errors
  redis = {
    get: async () => null,
    set: async () => null,
    incr: async () => 0,
    keys: async () => [],
    hset: async () => null,
    hget: async () => null,
    hgetall: async () => ({}),
    zadd: async () => 0,
    zrange: async () => [],
    zcard: async () => 0,
    expire: async () => 0,
    zremrangebyscore: async () => 0,
    hdel: async () => 0,
    hincrby: async () => 0,
    decr: async () => 0,
    ping: async () => "PONG",
  } as unknown as Redis
}

export default redis
