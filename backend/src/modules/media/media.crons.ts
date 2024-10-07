import { Injectable, Logger } from "@nestjs/common";
import { MediaService } from "./media.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class MediaCronsService {
  private readonly logger = new Logger(MediaCronsService.name);

  constructor(private mediaService: MediaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async clearOrphanMedias() {
    this.logger.log("Removing orphan medias...");
    await this.mediaService.removeOrphanMedias();
    this.logger.log("All orphan medias are been removed successfully.");
  }
}
