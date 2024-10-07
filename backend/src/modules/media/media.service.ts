import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { dateFns } from "src/common/lib/date-fns";
import { DatabaseService } from "src/common/providers/database/database.service";
import { S3Service } from "../s3/s3.service";
import { files } from "src/common/lib/files";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private db: DatabaseService,
    private s3: S3Service,
    @InjectQueue("optimizeVideoQueue") private optimizeVideoQueue: Queue
  ) {}

  /**
   * Save a file uploaded with Multer to S3 and create a media record.
   *
   * @param params.filePath The path to the file
   * @param params.originalFileName The original file name
   * @returns The media record
   */
  async uploadFileToS3({
    filePath,
    originalFileName,
  }: {
    filePath: string;
    originalFileName: string;
  }) {
    const fileInfos = await files.getFileInfos(filePath);

    // -- Save the file to S3
    const fileKey = await this.s3.upload({
      filePath: filePath,
      fileName: originalFileName,
      mimeType: fileInfos.mimeType,
    });

    const media = await this.create({
      data: {
        fileKey: fileKey,
        fileName: originalFileName,
        mimeType: fileInfos.mimeType,
        size: fileInfos.size,
      },
    });

    return media;
  }

  async create({ data }: { data: Prisma.MediaCreateInput }) {
    // -- create
    const media = await this.db.prisma.media.create({
      data: {
        ...data,
      },
    });

    return media;
  }

  async delete({ where }: { where: Prisma.MediaWhereUniqueInput }) {
    // -- Get the record from the database
    const media = await this.db.prisma.media.findUnique({
      where: {
        ...where,
      },
    });

    if (!media) {
      throw new HttpException(
        `Media to delete cannot be found.`,
        HttpStatus.NOT_FOUND
      );
    }

    // -- Delete the record from the database
    await this.db.prisma.media.delete({
      where: {
        id: media.id,
      },
    });
  }

  /**
   * Verify that the file has the correct size and type.
   * Throws an exception if the file does not meet the requirements.
   *
   * @param params.file The file to verify
   * @param params.allowedTypes The allowed MIME types
   * @param params.maxFileSize The maximum file size in Mo
   */
  async verifyMulterMaxSizeAndMimeType({
    file,
    allowedMimeTypes,
    maxFileSize,
  }: {
    file: Express.Multer.File;
    allowedMimeTypes: string[];
    maxFileSize: number;
  }) {
    const maxFileSizeInBytes = maxFileSize * 1024 * 1024; // Convert Mo to bytes
    const fileInfos = await files.getFileInfos(file.path);

    if (!allowedMimeTypes.includes(fileInfos.mimeType)) {
      throw new HttpException(
        "This file type is not supported.",
        HttpStatus.UNSUPPORTED_MEDIA_TYPE
      );
    }

    if (file.size > maxFileSizeInBytes) {
      throw new HttpException(
        `The file size must not exceed ${maxFileSize} Mo.`,
        HttpStatus.PAYLOAD_TOO_LARGE
      );
    }

    return true;
  }

  /**
   * Verify that the media has the correct size and type.
   * Throws an exception if the media does not meet the requirements.
   *
   * @param params.mediaId The media ID
   * @param params.allowedMimeTypes The allowed MIME types
   * @param params.maxFileSize The maximum file size in Mo
   */
  async verifyMediaMaxSizeAndMimeType({
    mediaId,
    allowedMimeTypes,
    maxFileSize,
  }: {
    mediaId: string;
    allowedMimeTypes: string[];
    maxFileSize: number;
  }) {
    const maxFileSizeInBytes = maxFileSize * 1024 * 1024; // Convert Mo to bytes

    const media = await this.db.prisma.media.findUnique({
      where: {
        id: mediaId,
      },
    });

    if (!media) {
      throw new HttpException(
        `Media to verify cannot be found.`,
        HttpStatus.NOT_FOUND
      );
    }

    if (!allowedMimeTypes.includes(media.mimeType)) {
      throw new HttpException(
        "This file type is not allowed.",
        HttpStatus.UNSUPPORTED_MEDIA_TYPE
      );
    }

    if (media.size > maxFileSizeInBytes) {
      throw new HttpException(
        `The file size must not exceed ${maxFileSize} Mo.`,
        HttpStatus.PAYLOAD_TOO_LARGE
      );
    }

    return true;
  }

  /**
   * Remove orphan media records.
   * An orphan media record is a media record that is not linked to any other record.
   */
  async removeOrphanMedias() {
    // -- Get the orphan media records
    const orphanMedias = await this.db.prisma.media.findMany({
      where: {
        AND: [
          {
            propertyPhotos: {
              none: {},
            },
          },
          {
            propertyDocuments: {
              none: {},
            },
          },
          {
            propertyVideo: {
              none: {},
            },
          },
          // {
          //   housekeeperAvatar: null,
          // },
          // {
          //   housekeeperDocumentsMedias: {
          //     none: {},
          //   },
          // },
          // {
          //   housekeeperInsurance: null,
          // },
        ],

        createdAt: {
          lt: dateFns.sub(new Date(), { hours: 1 }), // older than 1 hour records
        },
      },
    });

    // -- Delete the orphan media records
    for (const media of orphanMedias) {
      this.logger.log(
        `Deleting orphan media #${media.id} with FileKey [${media.fileKey}]...`
      );

      await this.delete({
        where: {
          id: media.id,
        },
      }).catch((err) => {
        this.logger.error(
          `Error deleting orphan media #${media.id}: ${err.message}`
        );
      });
    }
  }

  async optimizeVideo({ mediaId }: { mediaId: string }) {
    await this.optimizeVideoQueue.add({ mediaId });
  }
}
