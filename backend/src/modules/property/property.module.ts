import { Module } from "@nestjs/common";
import { PropertyService } from "./property.service";
import { PropertyController } from "./controllers/property.controller";
import { SubscriberModule } from "../subscriber/subscriber.module";
import { CustomerPropertyController } from "./controllers/customer-property.controller";
import { ShortLinkModule } from "../short-link/short-link.module";

@Module({
  imports: [SubscriberModule, ShortLinkModule],
  controllers: [PropertyController, CustomerPropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
