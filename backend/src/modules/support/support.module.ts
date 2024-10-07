import { Module } from "@nestjs/common";
import { SupportController } from "./controllers/support.controller";
import { BrevoService } from "../brevo/brevo.service";

@Module({
  imports: [],
  providers: [BrevoService],
  controllers: [SupportController],
})
export class SupportModule {}
