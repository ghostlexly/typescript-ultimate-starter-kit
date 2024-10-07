import { Module } from "@nestjs/common";
import { ShortLinkService } from "./short-link.service";
import { ShortLinkController } from "./controllers/short-link.controller";

@Module({
  controllers: [ShortLinkController],
  providers: [ShortLinkService],
  exports: [ShortLinkService],
})
export class ShortLinkModule {}
