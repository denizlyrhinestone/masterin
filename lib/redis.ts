import { Redis } from "@upstash/redis"

// Create a mock Redis client that doesn't throw errors
const createMockRedisClient = () => {
  console.warn("Using mock Redis client - Redis functionality will be limited")
  return {
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
    zincrby: async () => 0,
  } as unknown as Redis
}

// Initialize Redis client or fallback to mock
let redis: Redis

// Check if Redis environment variables are available
const hasRedisConfig = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

if (hasRedisConfig) {
  try {
    // Create the real Redis client
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    })

    // We won't test the connection here to avoid errors during initialization
    console.log("Redis client initialized")
  } catch (error) {
    console.error("Failed to initialize Redis client:", error)
    redis = createMockRedisClient()
  }
} else {
  console.warn("Redis environment variables not found")
  redis = createMockRedisClient()
}

// Wrap Redis methods to catch errors
const safeRedis = new Proxy(redis, {
  get(target, prop) {
    const originalMethod = target[prop as keyof typeof target]

    if (typeof originalMethod === "function") {
      return async (...args: any[]) => {
        try {
          return await originalMethod.apply(target, args)
        } catch (error) {
          console.error(`Redis error in ${String(prop)} method:`, error)

          // Return appropriate fallback values based on the method
          switch (prop) {
            case "get":
              return null
            case "incr":
              return 0
            case "keys":
              return []
            case "hgetall":
              return {}
            case "zrange":
              return []
            case "zcard":
              return 0
            default:
              return null
          }
        }
      }
    }

    return originalMethod
  },
})

export default safeRedis
