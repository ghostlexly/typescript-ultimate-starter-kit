import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  StorageClass,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import fs from "fs";
import path from "path";
import { dateFns } from "src/common/lib/date-fns";
import { files } from "src/common/lib/files";

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    endpoint: this.configService.getOrThrow("S3_ENDPOINT"),
    region: "auto", // [ex for AWS: eu-west-3] [ex for Cloudflare: auto]
    credentials: {
      accessKeyId: this.configService.getOrThrow("S3_ACCESS_KEY"),
      secretAccessKey: this.configService.getOrThrow("S3_SECRET_KEY"),
    },
  }); // eu-west-3 is Paris
  private bucketName = this.configService.getOrThrow("S3_BUCKET");

  constructor(private configService: ConfigService) {}

  /**
   * Save a file to S3 bucket and create a record in the database
   *
   * @param filePath The path to the file
   * @param fileName The name of the file to store in S3
   * @param mimeType The MIME type of the file
   * @param storageClass The storage class of the file in S3. [STANDARD_IA] (Standard Infrequent Access) is 2x cheaper than STANDARD for still good performance || [STANDARD] is the default for frequent access
   *
   * @returns The fileKey in S3
   */
  async upload({
    filePath,
    fileName,
    mimeType,
    storageClass = "STANDARD_IA",
  }: {
    filePath: string;
    fileName: string;
    mimeType: string;
    storageClass?: StorageClass;
  }) {
    const buffer = fs.readFileSync(filePath);
    const normalizedFileName = files.getNormalizedFileName(fileName);

    const fileKey = path.join(
      dateFns.format(new Date(), "yyyy"),
      dateFns.format(new Date(), "MM"),
      dateFns.format(new Date(), "dd"),
      normalizedFileName
    );

    // -- Save to S3
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: buffer,
        StorageClass: storageClass,
        ContentType: mimeType,
      })
    );

    return fileKey;
  }

  /**
   * Download a file from S3 to /tmp directory and return the path
   * @param params.fileKey The key of the file in S3
   * @param params.destinationPath The path to save the downloaded file
   * @returns The path to the downloaded file
   */
  async downloadToFile({
    fileKey,
    destinationPath,
  }: {
    fileKey: string;
    destinationPath?: string;
  }) {
    if (!destinationPath) {
      destinationPath = path.join("/tmp", path.basename(fileKey));
    }

    const data = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      })
    );

    if (!data.Body) {
      throw new HttpException("File not found", HttpStatus.NOT_FOUND);
    }

    const fileWriteStream = fs.createWriteStream(destinationPath);

    const stream = new WritableStream({
      write(chunk) {
        fileWriteStream.write(chunk);
      },
      close() {
        fileWriteStream.close();
      },
      abort(err) {
        fileWriteStream.destroy(err);
        throw err;
      },
    });

    // You cannot await just the pipeTo() because you must wait for
    // both pipeTo AND createWriteStream to finish.
    await new Promise((resolve, reject) => {
      fileWriteStream.on("finish", resolve);
      fileWriteStream.on("error", reject);
      data.Body?.transformToWebStream().pipeTo(stream);
    });

    return destinationPath;
  }

  /**
   * Download a file from S3 to memory and return the base64 string
   */
  async downloadToMemoryBase64({ fileKey }: { fileKey: string }) {
    const data = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      })
    );

    if (!data.Body) {
      throw new HttpException("File not found", HttpStatus.NOT_FOUND);
    }

    const contentType = data.ContentType;
    const streamToString = await data.Body.transformToString("base64");

    return {
      contentType,
      base64: streamToString,
    };
  }

  /**
   * Delete a file from S3 bucket
   */
  async delete({ fileKey }: { fileKey: string }) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      })
    );
  }

  /**
   * Get a presigned URL to upload a file to a S3 bucket
   */
  async getPresignedUploadUrl({
    fileKey,
    storageClass = "STANDARD_IA",
  }: {
    fileKey: string;
    storageClass?: StorageClass;
  }) {
    const presignedUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        StorageClass: storageClass,
      }),
      { expiresIn: 1800 } // 30 minutes
    );

    return presignedUrl;
  }
}
