import { Module } from "@nestjs/common";
import { SmsNotificationService } from "./sms-notification.service";
import { BullModule } from "@nestjs/bull";
import { join } from "path";
import { CustomerSmsNotificationController } from "./controllers/customer-sms-notification.controller";
import { TwilioService } from "../twilio/twilio.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "SmsSendingQueue",
      processors: [join(__dirname, "queues", "sms-sending.processor.js")],
    }),
  ],
  providers: [SmsNotificationService, TwilioService],
  controllers: [CustomerSmsNotificationController],
  exports: [],
})
export class SmsNotificationModule {}
