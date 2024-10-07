import { Global, Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { S3Service } from "src/modules/s3/s3.service";

@Module({
  imports: [],
  providers: [DatabaseService, S3Service],
  controllers: [],
  exports: [DatabaseService],
})
@Global()
export class DatabaseModule {}
