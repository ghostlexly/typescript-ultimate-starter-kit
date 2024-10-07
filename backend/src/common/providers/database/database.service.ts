import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import {
  createExtendedPrismaClient,
  ExtendedPrismaClient,
} from "./prisma.instance";
import { S3Service } from "src/modules/s3/s3.service";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public prisma: ExtendedPrismaClient;

  constructor(private s3: S3Service) {
    this.prisma = createExtendedPrismaClient({ s3: this.s3 });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
