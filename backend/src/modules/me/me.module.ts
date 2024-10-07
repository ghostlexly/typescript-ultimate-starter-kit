import { Module } from "@nestjs/common";
import { MeService } from "./me.service";
import { MeController } from "./me.controller";

@Module({
  imports: [],
  providers: [MeService],
  controllers: [MeController],
  exports: [],
})
export class MeModule {}
