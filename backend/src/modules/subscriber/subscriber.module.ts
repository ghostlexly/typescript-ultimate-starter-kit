import { Module } from "@nestjs/common";
import { SubscriberService } from "./subscriber.service";
import { SubscriberController } from "./controllers/subscriber.controller";
import { CustomerSubscriberController } from "./controllers/customer-subscriber.controller";

@Module({
  imports: [],
  providers: [SubscriberService],
  controllers: [SubscriberController, CustomerSubscriberController],
  exports: [SubscriberService],
})
export class SubscriberModule {}
