import { Module } from "@nestjs/common";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { MediaCronsService } from "./media.crons";
import { FfmpegService } from "../ffmpeg/ffmpeg.service";
import { S3Service } from "../s3/s3.service";
import { BullModule } from "@nestjs/bull";
import { join } from "path";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "optimizeVideoQueue",
      processors: [join(__dirname, "queues", "optimize-video.processor.js")],
    }),
  ],
  providers: [MediaService, MediaCronsService, FfmpegService, S3Service],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
