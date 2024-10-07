import { INestApplicationContext, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DoneCallback, Job } from "bull";
import { AppModule } from "src/app.module";
import { DatabaseService } from "src/common/providers/database/database.service";
import { FfmpegService } from "src/modules/ffmpeg/ffmpeg.service";
import { S3Service } from "src/modules/s3/s3.service";
import path from "path";
import os from "os";
import crypto from "crypto";

/**
 * Initialize the application context
 */
const bootstrap = async (job: Job, cb: DoneCallback) => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false, // disable the default logger to hide the startup logs
  });
  const logger = new Logger("OptimizeVideoProcessor");
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
  const s3Service = app.get(S3Service);
  const ffmpegService = app.get(FfmpegService);
  // -----------------------------------

  const { mediaId } = job.data;

  // -- get media
  const media = await db.prisma.media.findFirst({
    where: { id: mediaId },
  });

  if (!media) {
    logger.error(`Media ${mediaId} not found.`);
    cb(new Error(`Media ${mediaId} not found.`));
    return;
  }

  // -- download the video file from S3
  logger.log(`Downloading video file ${mediaId}...`);

  const tempVideoFilePath = path.join(
    os.tmpdir(),
    `${crypto.randomUUID()}_${media.fileName}`
  );

  await s3Service.downloadToFile({
    fileKey: media.fileKey,
    destinationPath: tempVideoFilePath,
  });

  // -- optimize the video file with ffmpeg
  logger.log(`Optimizing video file ${mediaId}...`);

  const fileNameMp4 = media.fileName.replace(/\.[^.]+$/, ".mp4");
  const destVideoFilePath = path.join(
    os.tmpdir(),
    `${crypto.randomUUID()}_${fileNameMp4}`
  );

  await ffmpegService.processVideoEncoding({
    inputFilePath: tempVideoFilePath,
    outputFilePath: destVideoFilePath,
  });

  // -- upload the optimized video file to S3
  logger.log(`Uploading optimized video file ${mediaId}...`);

  const fileKey = await s3Service.upload({
    filePath: destVideoFilePath,
    fileName: fileNameMp4,
    mimeType: "video/mp4",
  });

  // -- update the media record with the new file key
  await db.prisma.media.update({
    where: { id: mediaId },
    data: { fileKey, mimeType: "video/mp4", fileName: fileNameMp4 },
  });

  logger.log(
    `Optimized video file ${mediaId} uploaded to S3 as ${fileKey} successfully.`
  );

  cb(null, "It works");
};

export default bootstrap;
