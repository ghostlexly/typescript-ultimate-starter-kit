import { INestApplicationContext, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DoneCallback, Job } from "bull";
import { AppModule } from "src/app.module";
import { DatabaseService } from "src/common/providers/database/database.service";
import { ShortLinkService } from "src/modules/short-link/short-link.service";
import { SubscriberService } from "src/modules/subscriber/subscriber.service";
import { TwilioService } from "src/modules/twilio/twilio.service";

/**
 * Initialize the application context
 */
const bootstrap = async (job: Job, cb: DoneCallback) => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false, // disable the default logger to hide the startup logs
  });
  const logger = new Logger("SmsSendingProcessor");
  app.useLogger(logger); // re-enable and use the logger on the app context
  logger.log(`Sandboxed application context created`);

  try {
    // -- Run the processor
    await processor({ job, cb, app, logger });
  } catch (error) {
    logger.error(error);
    cb(error);
  } finally {
    // -- Close the application context
    logger.log(`Sandboxed application context closed`);
    await app.close();
  }
};

/**
 * Processor
 */
const processor = async ({
  job,
  cb,
  app,
  logger,
}: {
  job: Job;
  cb: DoneCallback;
  app: INestApplicationContext;
  logger: Logger;
}) => {
  const db = app.get(DatabaseService);
  const twilio = app.get(TwilioService);
  const subscriberService = app.get(SubscriberService);
  const shortLinkService = app.get(ShortLinkService);
  // -----------------------------------
  const { smsNotificationId } = job.data;

  // -- get notifications
  const smsNotification = await db.prisma.smsNotification.findUnique({
    include: {
      listing: {
        include: {
          subscribers: true,
        },
      },
      property: true,
    },
    where: {
      id: smsNotificationId,
    },
  });
  const subscribers = smsNotification?.listing?.subscribers;

  if (!smsNotification || !subscribers) {
    throw new Error("SmsNotification not found or listingId is missing.");
  }

  // -- send sms
  for (const subscriber of subscribers) {
    // -- replace message variables
    let content = smsNotification.content;

    content = await subscriberService.personaliseText({
      subscriberId: subscriber.id,
      text: content,
    });

    // -- create short link
    const shortLinkUrl = await shortLinkService.generateViewLinkForProperty({
      propertyId: smsNotification.property.id,
      customerId: smsNotification.customerId,
      subscriberId: subscriber.id,
    });

    // -- replace {link} variable
    content = content.replace(/{link}/g, shortLinkUrl);

    logger.log(`Sending SMS to ${subscriber.phone}.`);
    await twilio.sendSms({
      recipient: subscriber.phone,
      content: content,
    });
  }

  cb(null, "It works");
};

export default bootstrap;
