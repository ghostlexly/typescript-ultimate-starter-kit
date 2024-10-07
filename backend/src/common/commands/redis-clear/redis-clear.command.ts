import { Command, CommandRunner } from "nest-commander";
import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { ConfigService } from "@nestjs/config";

@Injectable()
@Command({ name: "redis:clear", description: "Clear all Redis keys" })
export class RedisClearCommand extends CommandRunner {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    super();
    this.redis = new Redis({
      host: this.configService.get("REDIS_HOST"),
      port: this.configService.get("REDIS_PORT"),
    });
  }

  async run(): Promise<void> {
    try {
      await this.redis.flushall();
      console.log("All Redis keys have been cleared successfully.");
    } catch (error) {
      console.error("Error clearing Redis keys:", error);
    } finally {
      await this.redis.quit();
    }
  }
}
