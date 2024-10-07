import { INestApplicationContext, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DoneCallback, Job } from "bull";
import { AppModule } from "src/app.module";
import { DatabaseService } from "src/common/providers/database/database.service";

/**
 * Initialize the application context
 */
const bootstrap = async (job: Job, cb: DoneCallback) => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false, // disable the default logger to hide the startup logs
  });
  const logger = new Logger("TestProcessor");
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
const processor = async (params: {
  job: Job;
  cb: DoneCallback;
  app: INestApplicationContext;
  logger: Logger;
}) => {
  const { app, cb, logger } = params;

  const db = app.get(DatabaseService);
  // -----------------------------------

  // list all accounts
  const accounts = await db.prisma.account.findMany();
  logger.log(accounts);

  cb(null, "It works");
};

export default bootstrap;
