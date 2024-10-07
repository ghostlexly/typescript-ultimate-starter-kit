import { Module } from "@nestjs/common";
import { RedisClearCommand } from "./redis-clear.command";

@Module({
  providers: [RedisClearCommand],
})
export class RedisClearCommandModule {}
