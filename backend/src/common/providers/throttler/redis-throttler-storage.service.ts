import { Injectable } from "@nestjs/common";
import { ThrottlerStorage } from "@nestjs/throttler";
import { Redis } from "ioredis";
import { ThrottlerStorageRecord } from "@nestjs/throttler/dist/throttler-storage-record.interface";

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  private redis: Redis;

  constructor({ host, port }) {
    // Initialize Redis connection using configuration from ConfigService
    this.redis = new Redis({
      host: host,
      port: port,
    });
  }

  async getRecord(key: string): Promise<number[]> {
    // Retrieve all elements of the list stored at key
    const record = await this.redis.lrange(key, 0, -1);
    // Convert string timestamps to numbers
    return record.map(Number);
  }

  async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
    const multi = this.redis.multi();
    // Add current timestamp to the beginning of the list
    multi.lpush(key, Date.now().toString());
    // Trim the list to keep only the latest elements (if any limit was set)
    multi.ltrim(key, 0, -1);
    // Set or reset the expiration time for the key (convert milliseconds to seconds for Redis)
    multi.expire(key, Math.ceil(ttl / 1000));
    // Retrieve all elements of the list
    multi.lrange(key, 0, -1);
    // Get the remaining time to live for the key (in seconds)
    multi.ttl(key);

    // Execute all commands atomically
    const results = await multi.exec();

    if (!results) {
      throw new Error("Redis operation failed.");
    }

    // Count the total number of hits (length of the list)
    const totalHits = (results[3][1] as string[]).length;
    // Get the time to expire from the TTL command result (convert seconds back to milliseconds)
    const timeToExpire = (results[4][1] as number) * 1000;
    return { totalHits, timeToExpire };
  }
}
