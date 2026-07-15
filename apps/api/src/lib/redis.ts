import { Redis } from 'ioredis';

const REDIS_URL = process.env['REDIS_URL'] ?? 'redis://localhost:6379';

let redisConnected = false;
let retryCount = 0;
const MAX_RETRIES = 3;

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times: number) {
    retryCount = times;
    if (times > MAX_RETRIES) {
      return null; // stop retrying
    }
    return Math.min(times * 500, 3000); // exponential backoff, max 3s
  },
  reconnectOnError() {
    return false;
  },
});

redis.on('connect', () => {
  redisConnected = true;
  console.log('✅ Redis connected');
});

redis.on('error', (err: Error) => {
  if (retryCount <= 1) {
    console.warn('⚠️  Redis unavailable – running without cache:', err.message.split('\n')[0]);
  }
});

redis.on('reconnecting', () => {
  if (retryCount <= MAX_RETRIES) {
    console.log(`🔄 Redis reconnecting (attempt ${retryCount}/${MAX_RETRIES})...`);
  }
});

// Attempt initial connect quietly; swallow errors – all routes have mockDb fallback
redis.connect().catch(() => {
  /* silently ignored – fallback handled per-route */
});

// ─── Helpers ────────────────────────────────────────────────────────────────

export const isRedisReady = (): boolean => {
  return redis.status === 'ready';
};

export async function setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
  if (!isRedisReady()) return;
  try {
    await redis.setex(key, ttlSeconds, value);
  } catch (err) {
    console.warn('⚠️ Redis setEx failed:', (err as Error).message);
  }
}

export async function get(key: string): Promise<string | null> {
  if (!isRedisReady()) return null;
  try {
    return await redis.get(key);
  } catch (err) {
    console.warn('⚠️ Redis get failed:', (err as Error).message);
    return null;
  }
}

export async function del(key: string): Promise<void> {
  if (!isRedisReady()) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.warn('⚠️ Redis del failed:', (err as Error).message);
  }
}

export async function incr(key: string): Promise<number | null> {
  if (!isRedisReady()) return null;
  try {
    return await redis.incr(key);
  } catch (err) {
    console.warn('⚠️ Redis incr failed:', (err as Error).message);
    return null;
  }
}

export async function expire(key: string, seconds: number): Promise<number | null> {
  if (!isRedisReady()) return null;
  try {
    return await redis.expire(key, seconds);
  } catch (err) {
    console.warn('⚠️ Redis expire failed:', (err as Error).message);
    return null;
  }
}

export async function setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  if (!isRedisReady()) return;
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (err) {
    console.warn('⚠️ Redis setJson failed:', (err as Error).message);
  }
}

export async function getJson<T>(key: string): Promise<T | null> {
  if (!isRedisReady()) return null;
  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (err) {
    console.warn('⚠️ Redis getJson failed:', (err as Error).message);
    return null;
  }
}

// Redis key namespacing helpers
export const REDIS_KEYS = {
  passwordResetOTP: (userId: string) => `otp:reset:${userId}`,
  emailVerifyOTP: (userId: string) => `otp:verify:${userId}`,
  refreshToken: (userId: string) => `refresh:${userId}`,
  guestRoadmapCount: (ip: string) => `guest:roadmap:${ip}`,
  lessonCache: (conceptId: string) => `lesson:${conceptId}`,
  leaderboardGlobal: () => 'leaderboard:global',
  leaderboardWeekly: () => 'leaderboard:weekly',
} as const;
