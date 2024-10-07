import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import multer from "multer";
import { FfmpegService } from "../ffmpeg/ffmpeg.service";
import { MediaService } from "./media.service";

@Controller("media")
@ApiTags("Media")
@ApiBearerAuth("access-token")
export class MediaController {
  constructor(
    private service: MediaService,
    private ffmpegService: FfmpegService
  ) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "File upload",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: multer.diskStorage({}),
      limits: {
        files: 1,
      },
    })
  )
  async create(@UploadedFile() file: Express.Multer.File) {
    // -- verify the file
    await this.service.verifyMulterMaxSizeAndMimeType({
      file,
      allowedMimeTypes: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ],
      maxFileSize: 50,
    });

    // -- upload the file to S3
    const media = await this.service.uploadFileToS3({
      filePath: file.path,
      originalFileName: file.originalname,
    });

    return {
      status: "success",
      id: media.id,
    };
  }

  @Post("video")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "File upload",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: multer.diskStorage({}),
      limits: {
        files: 1,
      },
    })
  )
  async createVideo(@UploadedFile() file: Express.Multer.File) {
    // -- verify the file
    await this.service.verifyMulterMaxSizeAndMimeType({
      file,
      allowedMimeTypes: ["video/mp4", "video/quicktime"],
      maxFileSize: 50,
    });

    // -- upload the file to S3
    const media = await this.service.uploadFileToS3({
      filePath: file.path,
      originalFileName: file.originalname,
    });

    // -- optimize the video file with ffmpeg and reupload it to S3
    await this.service.optimizeVideo({ mediaId: media.id });

    return {
      status: "success",
      id: media.id,
    };
  }
}
